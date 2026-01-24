# Splitwise - Expense Tracking Application

A Rails-based expense tracking application similar to Splitwise, where users can track shared expenses, split bills, and manage balances with friends.

## 📋 Table of Contents

- [Features](#features)
- [System Requirements](#system-requirements)
- [Installation Guide](#installation-guide)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Key Features Explained](#key-features-explained)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## ✨ Features

- **User Authentication**: Sign up, sign in, and password reset functionality
- **Expense Management**: Create expenses with multiple items
- **Flexible Splitting**: Split expenses equally or unequally among participants
- **Tax & Tip Support**: Add tax and tip that split equally among all participants
- **Balance Tracking**: Real-time balance calculations showing who owes whom
- **Friend Management**: View expenses and balances with individual friends
- **Settlement System**: Record payments to settle debts
- **Modern UI**: Responsive design with Bootstrap 5 and custom styling

## 🖥️ System Requirements

### Required Software

- **Ruby**: 3.0.0
- **Rails**: 6.1.4
- **PostgreSQL**: 9.3 or higher
- **Node.js**: 12.13.1 or higher
- **Yarn**: Latest version
- **Git**: For version control

### Operating System Support

- Windows 10/11
- macOS
- Linux

## 📦 Installation Guide

### Step 1: Install System Dependencies

#### Windows

1. **Install Ruby 3.0.0**
   - Download from [RubyInstaller](https://rubyinstaller.org/downloads/)
   - Choose Ruby+Devkit 3.0.0
   - Run the installer and check "Add Ruby executables to your PATH"
   - Complete the MSYS2 installation when prompted

2. **Install PostgreSQL**
   - Download from [PostgreSQL Downloads](https://www.postgresql.org/download/windows/)
   - Install PostgreSQL (remember the password you set for the `postgres` user)
   - Add PostgreSQL `bin` directory to your PATH

3. **Install Node.js**
   - Download from [Node.js Downloads](https://nodejs.org/)
   - Install Node.js 12.13.1 or higher
   - Verify installation: `node --version`

4. **Install Yarn**
   ```powershell
   npm install -g yarn
   ```

#### macOS

1. **Install Homebrew** (if not already installed)
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Install Ruby 3.0.0**
   ```bash
   brew install rbenv
   rbenv init
   rbenv install 3.0.0
   rbenv global 3.0.0
   ```

3. **Install PostgreSQL**
   ```bash
   brew install postgresql@14
   brew services start postgresql@14
   ```

4. **Install Node.js**
   ```bash
   brew install node@12
   ```

5. **Install Yarn**
   ```bash
   npm install -g yarn
   ```

#### Linux (Ubuntu/Debian)

1. **Install Ruby 3.0.0**
   ```bash
   sudo apt update
   sudo apt install -y ruby-full ruby-dev build-essential
   ```

2. **Install PostgreSQL**
   ```bash
   sudo apt install -y postgresql postgresql-contrib
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   ```

3. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_12.x | sudo -E bash -
   sudo apt install -y nodejs
   ```

4. **Install Yarn**
   ```bash
   npm install -g yarn
   ```

### Step 2: Install Bundler

Bundler is Ruby's package manager. Install it globally:

```bash
gem install bundler
```

### Step 3: Clone the Repository

```bash
git clone <repository-url>
cd anitha-main
```

### Step 4: Install Ruby Dependencies

```bash
bundle install
```

This will install all Ruby gems specified in the `Gemfile`, including:
- Rails 6.1.4
- Devise (authentication)
- PostgreSQL adapter
- Bootstrap, jQuery, and other frontend libraries

### Step 5: Install JavaScript Dependencies

```bash
yarn install
```

This installs:
- Bootstrap 5
- jQuery
- Webpacker
- Other JavaScript packages

### Step 6: Configure Database

1. **Update Database Configuration**

   Edit `config/database.yml` and update the PostgreSQL credentials:

   ```yaml
   development:
     <<: *default
     database: anitha_main_development
     username: postgres
     password: your_postgres_password  # Change this to your PostgreSQL password
     host: 127.0.0.1
     port: 5432
   ```

   **Note**: On Windows, use `127.0.0.1` instead of `localhost` to avoid IPv6 connection issues.

2. **Create PostgreSQL User** (if needed)

   ```bash
   # Windows (using psql)
   psql -U postgres
   CREATE USER postgres WITH PASSWORD 'your_password';
   ALTER USER postgres CREATEDB;
   \q
   ```

   ```bash
   # macOS/Linux
   sudo -u postgres psql
   CREATE USER postgres WITH PASSWORD 'your_password';
   ALTER USER postgres CREATEDB;
   \q
   ```

## 🗄️ Database Setup

### Step 1: Create Databases

```bash
rails db:create
```

This creates:
- `anitha_main_development`
- `anitha_main_test`

### Step 2: Run Migrations

```bash
rails db:migrate
```

This creates all necessary tables:
- `users` - User accounts
- `expenses` - Expense records
- `expense_items` - Individual items in expenses
- `expense_item_shares` - User shares for each item
- `expense_shares` - Total amount each user owes per expense
- `payments` - Payment/settlement records

### Step 3: Seed Initial Data

```bash
rails db:seed
```

This creates 10 sample users using Faker for testing.

**Note**: To create a test user with known credentials, use Rails console:

```bash
rails console
```

Then run:
```ruby
User.create!(
  name: "Test User",
  email: "test@example.com",
  password: "password123",
  password_confirmation: "password123"
)
```

## 🚀 Running the Application

### Start the Rails Server

```bash
rails server
```

Or the shorter version:

```bash
rails s
```

The application will be available at: **http://localhost:3000**

### Access the Application

1. **Sign Up**: Navigate to `http://localhost:3000/users/sign_up`
2. **Sign In**: Navigate to `http://localhost:3000/users/sign_in`
3. **Dashboard**: After signing in, you'll see the main dashboard at `http://localhost:3000`

### Default Test User

If you created a test user:
- **Email**: `test@example.com`
- **Password**: `password123`

## 📁 Project Structure

```
anitha-main/
├── app/
│   ├── assets/
│   │   ├── images/
│   │   └── stylesheets/        # CSS/SCSS files
│   ├── controllers/
│   │   ├── expenses_controller.rb
│   │   ├── payments_controller.rb
│   │   └── static_controller.rb
│   ├── javascript/
│   │   ├── packs/
│   │   │   └── application.js
│   │   └── expense_form.js     # Dynamic form handling
│   ├── models/
│   │   ├── expense.rb
│   │   ├── expense_item.rb
│   │   ├── expense_item_share.rb
│   │   ├── expense_share.rb
│   │   ├── payment.rb
│   │   └── user.rb
│   └── views/
│       ├── devise/              # Authentication views
│       ├── expenses/             # Expense views
│       ├── payments/             # Payment views
│       └── static/               # Dashboard and friend pages
├── config/
│   ├── database.yml             # Database configuration
│   ├── routes.rb                 # Application routes
│   └── initializers/
│       └── devise.rb             # Devise configuration
├── db/
│   ├── migrate/                 # Database migrations
│   ├── schema.rb                 # Current database schema
│   └── seeds.rb                  # Seed data
├── Gemfile                       # Ruby dependencies
├── package.json                  # JavaScript dependencies
└── README.md                     # This file
```

## 🔑 Key Features Explained

### 1. Expense Creation

- Create expenses with multiple items
- Each item can have different participants
- Split items equally or assign custom amounts
- Add tax and tip (split equally among all participants)

### 2. Balance Calculation

- **Total Balance**: Net amount (positive = others owe you, negative = you owe others)
- **You Owe**: Total amount you owe to others
- **You Are Owed**: Total amount others owe you
- All balances calculated in real-time from expense shares

### 3. Friend Management

- View all friends in the sidebar
- Click on a friend to see:
  - Balance with that friend
  - All shared expenses
  - Who paid what

### 4. Settlement System

- Record payments to settle debts
- Payments create offsetting expense shares
- Expense history is preserved (payments don't delete expenses)

## 🧪 Testing

### Run Tests

```bash
rails test
```

### Run Specific Test Files

```bash
rails test test/models/expense_test.rb
rails test test/models/user_test.rb
```

### Test Coverage

Tests are written for:
- Expense creation and share calculation
- User balance calculations
- Expense item validations
- Payment/settlement logic

## 🔧 Troubleshooting

### Issue: PostgreSQL Connection Error

**Error**: `connection to server at "localhost" failed`

**Solution**:
1. Ensure PostgreSQL is running:
   ```bash
   # Windows
   Get-Service postgresql*
   
   # macOS/Linux
   brew services list  # or systemctl status postgresql
   ```

2. Update `config/database.yml` to use `127.0.0.1` instead of `localhost`

3. Verify PostgreSQL credentials match your installation

### Issue: Bundle Install Fails

**Error**: `Could not find gem 'pg'`

**Solution**:
1. Install PostgreSQL development libraries:
   ```bash
   # Windows: Included with PostgreSQL installer
   # macOS
   brew install postgresql
   # Linux
   sudo apt-get install libpq-dev
   ```

2. Then run: `bundle install`

### Issue: Yarn Install Fails

**Error**: `yarn: command not found`

**Solution**:
```bash
npm install -g yarn
```

### Issue: Webpacker Compilation Error

**Error**: `Webpacker can't find application.js`

**Solution**:
```bash
rails webpacker:install
rails assets:precompile
```

### Issue: Database Migration Errors

**Error**: `PG::UndefinedTable` or migration errors

**Solution**:
```bash
rails db:drop db:create db:migrate db:seed
```

**Warning**: This will delete all existing data!

### Issue: Port Already in Use

**Error**: `Address already in use - bind(2) for "0.0.0.0:3000"`

**Solution**:
1. Find the process using port 3000:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   
   # macOS/Linux
   lsof -ti:3000
   ```

2. Kill the process or use a different port:
   ```bash
   rails server -p 3001
   ```

## 📧 Email Configuration

### Development

The application uses `letter_opener` gem for development. Emails (like password reset) will open in your browser automatically.

### Production

For production, configure SMTP settings in `config/environments/production.rb`:

```ruby
config.action_mailer.delivery_method = :smtp
config.action_mailer.smtp_settings = {
  address: 'smtp.gmail.com',
  port: 587,
  domain: 'yourdomain.com',
  user_name: ENV['SMTP_USERNAME'],
  password: ENV['SMTP_PASSWORD'],
  authentication: 'plain',
  enable_starttls_auto: true
}
```

## 🔐 Security Notes

- Passwords are encrypted using bcrypt (via Devise)
- Never commit sensitive data (passwords, API keys) to version control
- Use environment variables for sensitive configuration
- The `config/database.yml` file should not contain production passwords

## 📝 Additional Commands

### Rails Console

```bash
rails console
# or
rails c
```

Useful for:
- Creating test users
- Checking data
- Running model methods

### Database Reset

```bash
rails db:reset
```

This drops, creates, migrates, and seeds the database.

### View Routes

```bash
rails routes
```

Shows all available routes in the application.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Submit a pull request

## 📄 License

This project is part of a Rails assignment.

## 📞 Support

For issues or questions:
- Check the troubleshooting section above
- Review Rails and Devise documentation
- Check application logs in `log/development.log`

---

**Happy Coding! 🚀**
