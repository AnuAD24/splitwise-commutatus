require "test_helper"

class ExpenseItemTest < ActiveSupport::TestCase
  def setup
    @user = User.create!(name: "User", email: "user@example.com", password: "password123")
    @expense = Expense.create!(
      paid_by: @user,
      description: "Dinner",
      date: Date.today
    )
  end

  test "should validate presence of description" do
    item = ExpenseItem.new(expense: @expense, amount: 100.0)
    assert_not item.valid?
    assert_includes item.errors[:description], "can't be blank"
  end

  test "should validate presence of amount" do
    item = ExpenseItem.new(expense: @expense, description: "Pizza")
    assert_not item.valid?
    assert_includes item.errors[:amount], "can't be blank"
  end

  test "should validate amount is positive" do
    item = ExpenseItem.new(expense: @expense, description: "Pizza", amount: -10)
    assert_not item.valid?
  end

  test "should validate shares sum equals amount" do
    item = ExpenseItem.create!(expense: @expense, description: "Pizza", amount: 100.0)
    friend = User.create!(name: "Friend", email: "friend@example.com", password: "password123")
    
    item.expense_item_shares.create!(user: friend, amount: 50.0)
    
    assert_not item.valid?
    assert_includes item.errors[:base], "Sum of shares (50.0) must equal item amount (100.0)"
  end
end
