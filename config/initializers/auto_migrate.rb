if Rails.env.production? && ENV["RENDER"].present?
  begin
    ActiveRecord::Base.connection
    if ActiveRecord::MigrationContext.new("db/migrate", ActiveRecord::SchemaMigration).needs_migration?
      Rails.logger.info("Running pending migrations...")
      ActiveRecord::MigrationContext.new("db/migrate", ActiveRecord::SchemaMigration).migrate
    end
  rescue StandardError => e
    Rails.logger.error("Auto-migrate failed: #{e.class} #{e.message}")
  end
end
