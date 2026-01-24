class StaticController < ApplicationController
  def dashboard
    @total_balance = current_user.total_balance
    @total_i_owe = current_user.total_i_owe
    @total_owed_to_me = current_user.total_owed_to_me
    @friends_i_owe = current_user.friends_i_owe
    @friends_who_owe_me = current_user.friends_who_owe_me
    @my_expenses = current_user.expenses.order(date: :desc).limit(10)
    @all_users = User.where.not(id: current_user.id)
  end

  def person
    @friend = User.find(params[:id])
    @balance_with_friend = current_user.balance_with(@friend)
    
    # Expenses where I paid and friend is involved
    @expenses_i_paid = current_user.expenses
                                   .joins(:expense_shares)
                                   .where(expense_shares: { user_id: @friend.id })
                                   .distinct
                                   .order(date: :desc)
    
    # Expenses where friend paid and I'm involved
    @expenses_friend_paid = Expense.where(paid_by: @friend)
                                   .joins(:expense_shares)
                                   .where(expense_shares: { user_id: current_user.id })
                                   .distinct
                                   .order(date: :desc)
  end
end
