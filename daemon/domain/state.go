package domain

// State -
type State struct {
	Status    uint64       `json:"status"`
	Unraid    *Unraid      `json:"unraid"`
	Operation *Operation   `json:"operation"`
	History   *History     `json:"history"`
	Queue     []*QueueEntry `json:"queue"`
	// Plan      *Plan      `json:"plan"`
}
