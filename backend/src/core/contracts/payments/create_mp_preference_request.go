package payments

type CreateMPPreferenceItemInput struct {
	Title       string  `json:"title" binding:"required"`
	Quantity    int     `json:"quantity" binding:"required,min=1"`
	UnitPrice   float64 `json:"unit_price" binding:"required,gt=0"`
	CurrencyID  string  `json:"currency_id"`
	Description string  `json:"description"`
	PictureURL  string  `json:"picture_url"`
}

type CreateMPPreferencePayerInput struct {
	Name    string `json:"name"`
	Surname string `json:"surname"`
	Email   string `json:"email" binding:"required,email"`
	Phone   string `json:"phone"`
	Address string `json:"address"`
}

type CreateMPPreferenceRequest struct {
	OrderID   string                         `json:"order_id" binding:"required"`
	Items     []CreateMPPreferenceItemInput  `json:"items" binding:"required,dive"`
	Payer     CreateMPPreferencePayerInput   `json:"payer"`
	BackURL   string                         `json:"back_url"`
}

type CreateMPPreferenceResponse struct {
	PreferenceID     string `json:"preference_id"`
	InitPoint        string `json:"init_point"`
	SandboxInitPoint string `json:"sandbox_init_point"`
	PublicKey        string `json:"public_key"`
}
