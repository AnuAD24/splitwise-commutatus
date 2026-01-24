class Payment < ApplicationRecord
  belongs_to :payer, class_name: 'User'
  belongs_to :payee, class_name: 'User'

  validates :payer, presence: true
  validates :payee, presence: true
  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :date, presence: true
  validate :payer_and_payee_different

  after_create :apply!

  def apply!
    # Create a settlement expense to track this payment
    # This expense has no items, so calculate_shares! will skip it
    payment_expense = Expense.create!(
      paid_by: payer,
      description: "Payment to #{payee.name}",
      date: date,
      total_amount: amount,
      tax: 0,
      tip: 0
    )

    # Manually create shares to offset balances
    # Negative share for payer (reduces what they owe)
    ExpenseShare.create!(
      expense: payment_expense,
      user: payer,
      amount: -amount
    )

    # Positive share for payee (reduces what they're owed)
    ExpenseShare.create!(
      expense: payment_expense,
      user: payee,
      amount: amount
    )
  end

  private

  def payer_and_payee_different
    if payer_id == payee_id
      errors.add(:base, "Payer and payee must be different")
    end
  end
end
