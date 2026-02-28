package domain

import "github.com/cskr/pubsub"

type Context struct {
	Config

	Port      string
	ConfigDir string
	Hub       *pubsub.PubSub
}
