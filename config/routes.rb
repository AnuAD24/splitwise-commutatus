Rails.application.routes.draw do
  devise_for :users
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html

  root to: "static#dashboard"
  get 'people/:id', to: 'static#person', as: 'person'

  resources :expenses, only: [:new, :create, :index, :show, :destroy]
  resources :payments, only: [:new, :create]
end
