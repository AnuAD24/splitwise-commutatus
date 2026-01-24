class CreateExpenseShares < ActiveRecord::Migration[6.1]
  def change
    create_table :expense_shares do |t|
      t.references :expense, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.decimal :amount, precision: 10, scale: 2, null: false

      t.timestamps
    end

    add_index :expense_shares, [:expense_id, :user_id], unique: true
  end
end
