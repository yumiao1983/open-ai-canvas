package service

import (
	"encoding/json"
	"errors"
	"strings"

	"gorm.io/gorm"
	"infinite-canvas/backend/internal/model"
)

// PersonalChannelConfig is intentionally an opaque JSON document. The web
// client owns its channel/model schema, while the server owns authentication,
// user isolation and encrypted persistence.
type PersonalChannelConfig struct {
	Channels []map[string]any `json:"channels"`
}

func (s *Service) PersonalChannelConfig(actor *model.User) (*PersonalChannelConfig, error) {
	if actor == nil {
		return nil, Unauthorized("请先登录")
	}
	stored, err := s.repo.UserChannelConfig(actor.ID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return &PersonalChannelConfig{Channels: []map[string]any{}}, nil
	}
	if err != nil {
		return nil, err
	}
	plain, err := s.decryptSettingSecret(stored.ConfigJSON)
	if err != nil {
		return nil, err
	}
	result := &PersonalChannelConfig{}
	if err := json.Unmarshal([]byte(strings.TrimSpace(plain)), result); err != nil {
		return nil, err
	}
	return result, nil
}

func (s *Service) SavePersonalChannelConfig(actor *model.User, input PersonalChannelConfig) error {
	if actor == nil {
		return Unauthorized("请先登录")
	}
	encodedBytes, err := json.Marshal(PersonalChannelConfig{Channels: input.Channels})
	if err != nil {
		return err
	}
	encoded := string(encodedBytes)
	cipher, err := s.encryptSettingSecret(encoded)
	if err != nil {
		return err
	}
	stored, err := s.repo.UserChannelConfig(actor.ID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return s.repo.Create(&model.UserChannelConfig{UserID: actor.ID, ConfigJSON: cipher})
	}
	if err != nil {
		return err
	}
	stored.ConfigJSON = cipher
	return s.repo.SaveUserChannelConfig(stored)
}
