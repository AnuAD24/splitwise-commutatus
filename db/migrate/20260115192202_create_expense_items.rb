class CreateExpenseItems < ActiveRecord::Migration[6.1]
  def change
    create_table :expense_items do |t|
      t.references :expense, null: false, foreign_key: true
      t.string :description
      t.decimal :amount, precision: 10, scale: 2, null: false

      t.timestamps
    end
  end
end
