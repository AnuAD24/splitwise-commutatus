class ExpenseItem < ApplicationRecord
  belongs_to :expense
  has_many :expense_item_shares, dependent: :destroy

  accepts_nested_attributes_for :expense_item_shares, allow_destroy: true

  validates :expense, presence: true
  validates :description, presence: true
  validates :amount, presence: true, numericality: { greater_than: 0 }

  validate :shares_sum_equals_amount

  def split_equally(users)
    return if users.empty?

    amount_per_user = amount / users.count
    users.each do |user|
      expense_item_shares.find_or_initialize_by(user: user).update(amount: amount_per_user)
    end
  end

  def split_unequally(shares_hash)
    shares_hash.each do |user_id, share_amount|
      user = User.find(user_id)
      expense_item_shares.find_or_initialize_by(user: user).update(amount: share_amount.to_f)
    end
  end

  private

  def shares_sum_equals_amount
    return if expense_item_shares.empty? || expense_item_shares.all? { |s| s.marked_for_destruction? }

    shares_sum = expense_item_shares.reject(&:marked_for_destruction?).sum(&:amount)
    if shares_sum != amount
      errors.add(:base, "Sum of shares (#{shares_sum}) must equal item amount (#{amount})")
    end
  end
end
