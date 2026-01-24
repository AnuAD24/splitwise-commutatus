class ExpenseShare < ApplicationRecord
  belongs_to :expense
  belongs_to :user

  validates :expense, presence: true
  validates :user, presence: true
  validates :amount, presence: true
  validates :user_id, uniqueness: { scope: :expense_id }
end
