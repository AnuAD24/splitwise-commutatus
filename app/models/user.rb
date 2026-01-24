class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  # Associations
  has_many :expenses, foreign_key: 'paid_by_id', dependent: :destroy
  has_many :expense_shares, dependent: :destroy
  has_many :expense_item_shares, dependent: :destroy
  has_many :paid_payments, class_name: 'Payment', foreign_key: 'payer_id', dependent: :destroy
  has_many :received_payments, class_name: 'Payment', foreign_key: 'payee_id', dependent: :destroy

  # Balance calculation methods
  def total_owed_to_me
    # Sum of expense shares where I paid and others owe me
    ExpenseShare.joins("INNER JOIN expenses ON expenses.id = expense_shares.expense_id")
                .where("expenses.paid_by_id = ? AND expense_shares.user_id != ?", id, id)
                .sum(:amount)
  end

  def total_i_owe
    # Sum of expense shares where I owe others (they paid, I have a share)
    ExpenseShare.where(user_id: id)
                .joins("INNER JOIN expenses ON expenses.id = expense_shares.expense_id")
                .where("expenses.paid_by_id != ?", id)
                .sum(:amount)
  end

  def total_balance
    # Net balance: positive means others owe me, negative means I owe others
    total_owed_to_me - total_i_owe
  end

  def balance_with(friend)
    # Calculate balance with a specific friend
    # What friend owes me (expenses I paid that friend shares)
    friend_owes_me = ExpenseShare.joins("INNER JOIN expenses ON expenses.id = expense_shares.expense_id")
                                  .where("expenses.paid_by_id = ? AND expense_shares.user_id = ?", id, friend.id)
                                  .sum(:amount)

    # What I owe friend (expenses friend paid that I share)
    i_owe_friend = ExpenseShare.joins("INNER JOIN expenses ON expenses.id = expense_shares.expense_id")
                                .where("expenses.paid_by_id = ? AND expense_shares.user_id = ?", friend.id, id)
                                .sum(:amount)

    friend_owes_me - i_owe_friend
  end

  def friends_i_owe
    # Returns hash of {user => amount} where amount > 0 means I owe them
    result = {}
    ExpenseShare.where(user_id: id)
                .joins("INNER JOIN expenses ON expenses.id = expense_shares.expense_id")
                .where("expenses.paid_by_id != ?", id)
                .group('expenses.paid_by_id')
                .sum(:amount)
                .each do |payer_id, amount|
      result[User.find(payer_id)] = amount if amount > 0
    end
    result
  end

  def friends_who_owe_me
    # Returns hash of {user => amount} where amount > 0 means they owe me
    result = {}
    ExpenseShare.joins("INNER JOIN expenses ON expenses.id = expense_shares.expense_id")
                .where("expenses.paid_by_id = ? AND expense_shares.user_id != ?", id, id)
                .group('expense_shares.user_id')
                .sum(:amount)
                .each do |debtor_id, amount|
      result[User.find(debtor_id)] = amount if amount > 0
    end
    result
  end

  # Scopes
  def expenses_with(other_user)
    expenses.joins(:expense_shares)
            .where(expense_shares: { user_id: other_user.id })
            .distinct
  end
end
