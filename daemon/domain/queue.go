package domain

// QueueEntry represents a transfer operation waiting to run after the current operation finishes.
type QueueEntry struct {
	ID              string `json:"id"`
	Topic           string `json:"topic"`
	OpKind          uint64 `json:"opKind"`
	BytesToTransfer uint64 `json:"bytesToTransfer"`
	Packet          Packet `json:"-"` // internal only; excluded from JSON
}
