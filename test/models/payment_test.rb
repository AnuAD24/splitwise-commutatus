require "test_helper"

class PaymentTest < ActiveSupport::TestCase
  def setup
    @payer = User.create!(name: "Payer", email: "payer@example.com", password: "password123")
    @payee = User.create!(name: "Payee", email: "payee@example.com", password: "password123")
  end

  test "should validate payer and payee are different" do
    payment = Payment.new(
      payer: @payer,
      payee: @payer,
      amount: 50.0,
      date: Date.today
    )
    assert_not payment.valid?
    assert_includes payment.errors[:base], "Payer and payee must be different"
  end

  test "should create payment and apply to balances" do
    # First create an expense where payer owes payee
    expense = Expense.create!(
      paid_by: @payee,
      description: "Dinner",
      date: Date.today,
      tax: 0,
      tip: 0
    )
    item = expense.expense_items.create!(description: "Pizza", amount: 100.0)
    item.expense_item_shares.create!(user: @payer, amount: 100.0)
    expense.calculate_shares!

    # Payer should owe 100
    assert_equal 100.0, @payer.total_i_owe

    # Create payment of 50
    payment = Payment.create!(
      payer: @payer,
      payee: @payee,
      amount: 50.0,
      date: Date.today
    )

    # Payment should create offsetting shares
    # Payer's balance should be reduced by 50
    @payer.reload
    assert_equal 50.0, @payer.total_i_owe
  end
end
