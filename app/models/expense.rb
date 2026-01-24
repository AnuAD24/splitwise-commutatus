class Expense < ApplicationRecord
  belongs_to :paid_by, class_name: 'User'
  has_many :expense_items, dependent: :destroy
  has_many :expense_shares, dependent: :destroy
  has_many :expense_item_shares, through: :expense_items

  accepts_nested_attributes_for :expense_items, allow_destroy: true

  validates :paid_by, presence: true
  validates :date, presence: true
  validates :total_amount, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :tax, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validates :tip, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true

  before_save :calculate_total_amount
  after_save :calculate_shares!

  def calculate_shares!
    return if expense_items.reload.empty?

    # Clear existing shares
    expense_shares.destroy_all

    # Calculate item shares per user directly from database
    user_item_totals = ExpenseItemShare.joins(:expense_item)
                                       .where(expense_items: { expense_id: id })
                                       .group(:user_id)
                                       .sum(:amount)

    return if user_item_totals.empty?

    # Calculate tax and tip per user (split equally)
    participants_count = user_item_totals.keys.count
    return if participants_count.zero?

    tax_per_user = (tax || 0) / participants_count
    tip_per_user = (tip || 0) / participants_count

    # Create expense shares (item amount + tax + tip per user)
    user_item_totals.each do |user_id, item_total|
      total_share = item_total + tax_per_user + tip_per_user
      expense_shares.create!(user_id: user_id, amount: total_share)
    end
  end

  def participants
    User.where(id: ExpenseItemShare.joins(:expense_item).where(expense_items: { expense_id: id }).select(:user_id).distinct)
  end

  def participant_count
    ExpenseItemShare.joins(:expense_item).where(expense_items: { expense_id: id }).select(:user_id).distinct.count
  end

  def recalculate!
    calculate_total_amount
    save!
    calculate_shares!
  end

  private

  def calculate_total_amount
    items_total = expense_items.map(&:amount).compact.sum || 0
    self.total_amount = items_total + (tax || 0) + (tip || 0)
  end
end
