class ExpensesController < ApplicationController
  before_action :set_expense, only: [:show, :destroy]

  def index
    @expenses = current_user.expenses.order(date: :desc)
  end

  def show
  end

  def new
    @expense = Expense.new
    @expense.expense_items.build
    @all_users = User.where.not(id: current_user.id)
  end

  def create
    @expense = Expense.new(expense_params)
    @expense.paid_by = current_user
    @all_users = User.where.not(id: current_user.id)

    if @expense.save
      redirect_to root_path, notice: 'Expense was successfully created.'
    else
      render :new
    end
  end

  def destroy
    @expense.destroy
    redirect_to root_path, notice: 'Expense was successfully deleted.'
  end

  private

  def set_expense
    @expense = current_user.expenses.find(params[:id])
  end

  def expense_params
    params.require(:expense).permit(
      :description,
      :date,
      :tax,
      :tip,
      expense_items_attributes: [
        :id,
        :description,
        :amount,
        :_destroy,
        expense_item_shares_attributes: [
          :id,
          :user_id,
          :amount,
          :_destroy
        ]
      ]
    )
  end
end
