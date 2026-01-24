require "test_helper"

class UserTest < ActiveSupport::TestCase
  def setup
    @user = User.create!(name: "User", email: "user@example.com", password: "password123")
    @friend = User.create!(name: "Friend", email: "friend@example.com", password: "password123")
  end

  test "should calculate total balance correctly" do
    # Create expense where user paid and friend owes
    expense = Expense.create!(
      paid_by: @user,
      description: "Dinner",
      date: Date.today,
      tax: 0,
      tip: 0
    )

    item = expense.expense_items.create!(description: "Pizza", amount: 100.0)
    item.expense_item_shares.create!(user: @friend, amount: 100.0)
    expense.calculate_shares!

    # User should be owed 100
    assert_equal 100.0, @user.total_owed_to_me
    assert_equal 0.0, @user.total_i_owe
    assert_equal 100.0, @user.total_balance
  end

  test "should calculate balance with friend correctly" do
    # User pays, friend owes
    expense1 = Expense.create!(
      paid_by: @user,
      description: "Dinner",
      date: Date.today,
      tax: 0,
      tip: 0
    )
    item1 = expense1.expense_items.create!(description: "Pizza", amount: 100.0)
    item1.expense_item_shares.create!(user: @friend, amount: 100.0)
    expense1.calculate_shares!

    # Friend pays, user owes
    expense2 = Expense.create!(
      paid_by: @friend,
      description: "Lunch",
      date: Date.today,
      tax: 0,
      tip: 0
    )
    item2 = expense2.expense_items.create!(description: "Burger", amount: 50.0)
    item2.expense_item_shares.create!(user: @user, amount: 50.0)
    expense2.calculate_shares!

    # Balance: friend owes 100, user owes 50, so friend owes user 50
    balance = @user.balance_with(@friend)
    assert_equal 50.0, balance
  end

  test "should return friends who owe me" do
    expense = Expense.create!(
      paid_by: @user,
      description: "Dinner",
      date: Date.today,
      tax: 0,
      tip: 0
    )

    item = expense.expense_items.create!(description: "Pizza", amount: 100.0)
    item.expense_item_shares.create!(user: @friend, amount: 100.0)
    expense.calculate_shares!

    friends_who_owe = @user.friends_who_owe_me
    assert friends_who_owe.key?(@friend)
    assert_equal 100.0, friends_who_owe[@friend]
  end

  test "should return friends I owe" do
    expense = Expense.create!(
      paid_by: @friend,
      description: "Lunch",
      date: Date.today,
      tax: 0,
      tip: 0
    )

    item = expense.expense_items.create!(description: "Burger", amount: 50.0)
    item.expense_item_shares.create!(user: @user, amount: 50.0)
    expense.calculate_shares!

    friends_i_owe = @user.friends_i_owe
    assert friends_i_owe.key?(@friend)
    assert_equal 50.0, friends_i_owe[@friend]
  end
end
