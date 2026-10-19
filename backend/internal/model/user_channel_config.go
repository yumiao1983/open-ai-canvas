package model

import "time"

// UserChannelConfig keeps a user's personal provider configuration on the
// server. ConfigJSON is encrypted by the service before it reaches storage.
type UserChannelConfig struct {
	UserID     string    `json:"userId" gorm:"primaryKey;size:36"`
	ConfigJSON string    `json:"-" gorm:"type:text"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}
