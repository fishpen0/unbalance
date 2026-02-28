package core

import (
	"unbalance/daemon/common"
	"unbalance/daemon/domain"
	"unbalance/daemon/lib"

	"github.com/teris-io/shortid"
)

func (c *Core) enqueue(packet domain.Packet) {
	entry := &domain.QueueEntry{
		ID:     shortid.MustGenerate(),
		Topic:  packet.Topic,
		Packet: packet,
	}

	switch packet.Topic {
	case common.CommandScatterMove:
		entry.OpKind = common.OpScatterMove
		var plan domain.Plan
		if lib.Bind(packet.Payload, &plan) == nil {
			entry.BytesToTransfer = plan.BytesToTransfer
		}
	case common.CommandScatterCopy:
		entry.OpKind = common.OpScatterCopy
		var plan domain.Plan
		if lib.Bind(packet.Payload, &plan) == nil {
			entry.BytesToTransfer = plan.BytesToTransfer
		}
	case common.CommandGatherMove:
		entry.OpKind = common.OpGatherMove
		var plan domain.Plan
		if lib.Bind(packet.Payload, &plan) == nil {
			entry.BytesToTransfer = plan.BytesToTransfer
		}
	case common.CommandReplay:
		var op domain.Operation
		if lib.Bind(packet.Payload, &op) == nil {
			entry.OpKind = op.OpKind
			entry.BytesToTransfer = op.BytesToTransfer
		}
	}

	c.mu.Lock()
	c.state.Queue = append(c.state.Queue, entry)
	c.mu.Unlock()

	c.broadcastQueueUpdate()
}

func (c *Core) dequeueAndRun() {
	c.mu.Lock()
	if len(c.state.Queue) == 0 {
		c.mu.Unlock()
		return
	}
	entry := c.state.Queue[0]
	c.state.Queue = c.state.Queue[1:]
	c.mu.Unlock()

	c.broadcastQueueUpdate()

	switch entry.Packet.Topic {
	case common.CommandScatterMove:
		var plan domain.Plan
		lib.Bind(entry.Packet.Payload, &plan) //nolint:errcheck
		go c.scatterMove(plan)
	case common.CommandScatterCopy:
		var plan domain.Plan
		lib.Bind(entry.Packet.Payload, &plan) //nolint:errcheck
		go c.scatterCopy(plan)
	case common.CommandGatherMove:
		var plan domain.Plan
		lib.Bind(entry.Packet.Payload, &plan) //nolint:errcheck
		go c.gatherMove(plan)
	case common.CommandReplay:
		var op domain.Operation
		lib.Bind(entry.Packet.Payload, &op) //nolint:errcheck
		go c.replay(op)
	}
}

func (c *Core) removeFromQueue(id string) {
	c.mu.Lock()
	for i, e := range c.state.Queue {
		if e.ID == id {
			c.state.Queue = append(c.state.Queue[:i], c.state.Queue[i+1:]...)
			break
		}
	}
	c.mu.Unlock()

	c.broadcastQueueUpdate()
}

func (c *Core) broadcastQueueUpdate() {
	c.mu.Lock()
	q := c.state.Queue
	c.mu.Unlock()

	packet := &domain.Packet{Topic: common.EventQueueUpdate, Payload: q}
	c.ctx.Hub.Pub(packet, "socket:broadcast")
}
