require "test_helper"

class ExpenseTest < ActiveSupport::TestCase
  def setup
    @user = users(:one) || User.create!(name: "Test User", email: "test@example.com", password: "password123")
    @friend = User.create!(name: "Friend", email: "friend@example.com", password: "password123")
  end

  test "should create expense with items and shares" do
    expense = Expense.new(
      paid_by: @user,
      description: "Dinner",
      date: Date.today,
      tax: 10.0,
      tip: 5.0
    )

    item = expense.expense_items.build(description: "Pizza", amount: 100.0)
    share = item.expense_item_shares.build(user: @friend, amount: 100.0)

    assert expense.save
    assert expense.expense_items.count == 1
    assert expense.expense_item_shares.count == 1
  end

  test "should calculate shares correctly" do
    expense = Expense.create!(
      paid_by: @user,
      description: "Dinner",
      date: Date.today,
      tax: 10.0,
      tip: 5.0
    )

    item = expense.expense_items.create!(description: "Pizza", amount: 100.0)
    item.expense_item_shares.create!(user: @friend, amount: 100.0)

    expense.calculate_shares!

    assert expense.expense_shares.count == 1
    share = expense.expense_shares.first
    assert share.user == @friend
    # 100 (item) + 10 (tax) + 5 (tip) = 115
    assert_equal 115.0, share.amount
  end

  test "should split tax and tip equally among participants" do
    friend2 = User.create!(name: "Friend2", email: "friend2@example.com", password: "password123")
    
    expense = Expense.create!(
      paid_by: @user,
      description: "Dinner",
      date: Date.today,
      tax: 20.0,
      tip: 10.0
    )

    item = expense.expense_items.create!(description: "Pizza", amount: 100.0)
    item.expense_item_shares.create!(user: @friend, amount: 50.0)
    item.expense_item_shares.create!(user: friend2, amount: 50.0)

    expense.calculate_shares!

    assert expense.expense_shares.count == 2
    # Each should have: 50 (item share) + 10 (tax/2) + 5 (tip/2) = 65
    expense.expense_shares.each do |share|
      assert_equal 65.0, share.amount
    end
  end
end
