class PaymentsController < ApplicationController
  def new
    @payment = Payment.new
    @payment.date = Date.today
    @payment.payee_id = params[:payee_id] if params[:payee_id].present?
    @friends_i_owe = current_user.friends_i_owe
  end

  def create
    @payment = Payment.new(payment_params)
    @payment.payer = current_user
    @friends_i_owe = current_user.friends_i_owe

    if @payment.save
      redirect_to root_path, notice: 'Payment was successfully recorded.'
    else
      render :new
    end
  end

  private

  def payment_params
    params.require(:payment).permit(:payee_id, :amount, :notes, :date)
  end
end
