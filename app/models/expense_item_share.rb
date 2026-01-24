class ExpenseItemShare < ApplicationRecord
  belongs_to :expense_item
  belongs_to :user

  validates :expense_item, presence: true
  validates :user, presence: true
  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :user_id, uniqueness: { scope: :expense_item_id }
end
