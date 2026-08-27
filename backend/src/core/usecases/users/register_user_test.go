package users

import (
	"context"
	"testing"
	"time"

	"ecommerce-ganador/backend/src/core/entities/users"
)

// MockUsersPersistor implements UsersPersistor for testing
type MockUsersPersistor struct {
	usersByEmail map[string]users.User
	usersByID    map[string]users.User
}

func NewMockUsersPersistor() *MockUsersPersistor {
	return &MockUsersPersistor{
		usersByEmail: make(map[string]users.User),
		usersByID:    make(map[string]users.User),
	}
}

func (m *MockUsersPersistor) Create(_ context.Context, u users.User) (users.User, error) {
	u.ID = "usr-mock-123"
	m.usersByEmail[u.Email] = u
	m.usersByID[u.ID] = u
	return u, nil
}

func (m *MockUsersPersistor) GetByEmail(_ context.Context, email string) (users.User, error) {
	if u, ok := m.usersByEmail[email]; ok {
		return u, nil
	}
	return users.User{}, ErrUserNotFound
}

func (m *MockUsersPersistor) GetByID(_ context.Context, id string) (users.User, error) {
	if u, ok := m.usersByID[id]; ok {
		return u, nil
	}
	return users.User{}, ErrUserNotFound
}

func (m *MockUsersPersistor) List(_ context.Context) ([]users.User, error) {
	var list []users.User
	for _, u := range m.usersByID {
		list = append(list, u)
	}
	return list, nil
}

// MockTokenProvider implements TokenProvider for testing
type MockTokenProvider struct{}

func (m *MockTokenProvider) GenerateAccessToken(userID, email, role string, _ time.Duration) (string, error) {
	return "mock_access_token_" + userID, nil
}

func (m *MockTokenProvider) GenerateRefreshToken(userID string, _ time.Duration) (string, error) {
	return "mock_refresh_token_" + userID, nil
}

func (m *MockTokenProvider) ValidateToken(_ string) (string, string, error) {
	return "usr-mock-123", "customer", nil
}

func TestRegisterUserImpl_Execute_Success(t *testing.T) {
	persistor := NewMockUsersPersistor()
	tokenProvider := &MockTokenProvider{}
	uc := NewRegisterUserImpl(persistor, tokenProvider, nil, 24*time.Hour)

	input := RegisterUserInput{
		FullName: "Alex Morgan",
		Email:    "alex.test@example.com",
		Password: "password123",
		Phone:    "+54 9 11 4455-6677",
	}

	output, err := uc.Execute(context.Background(), input)
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}

	if output.User.Email != input.Email {
		t.Errorf("expected email %s, got %s", input.Email, output.User.Email)
	}

	if output.AccessToken == "" {
		t.Errorf("expected access token, got empty")
	}
}

func TestRegisterUserImpl_Execute_WhenEmailAlreadyExists_ReturnsErr(t *testing.T) {
	persistor := NewMockUsersPersistor()
	persistor.usersByEmail["existing@example.com"] = users.User{
		Email: "existing@example.com",
	}

	tokenProvider := &MockTokenProvider{}
	uc := NewRegisterUserImpl(persistor, tokenProvider, nil, 24*time.Hour)

	input := RegisterUserInput{
		FullName: "Duplicate User",
		Email:    "existing@example.com",
		Password: "password123",
	}

	_, err := uc.Execute(context.Background(), input)
	if err != ErrEmailAlreadyInUse {
		t.Fatalf("expected ErrEmailAlreadyInUse, got: %v", err)
	}
}
