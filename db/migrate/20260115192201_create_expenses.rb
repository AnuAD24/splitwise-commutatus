class CreateExpenses < ActiveRecord::Migration[6.1]
  def change
    create_table :expenses do |t|
      t.references :paid_by, null: false, foreign_key: { to_table: :users }
      t.string :description
      t.date :date, null: false
      t.decimal :total_amount, precision: 10, scale: 2, default: 0.0
      t.decimal :tax, precision: 10, scale: 2, default: 0.0
      t.decimal :tip, precision: 10, scale: 2, default: 0.0

      t.timestamps
    end
  end
end
