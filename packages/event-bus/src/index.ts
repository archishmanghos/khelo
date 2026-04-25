import type { DomainEvent, EventType } from '@khelo/types';
import { createLogger } from '@khelo/logger';

// ─── Event Bus Interface ─────────────────────────────────────────────────────

export type EventHandler<T = unknown> = (event: DomainEvent<T>) => void | Promise<void>;

/**
 * Abstract EventBus interface.
 *
 * Current implementation: InMemoryEventBus (single-process, dev/monolith)
 * Future implementations: KafkaEventBus, RedisEventBus (microservices)
 */
export interface IEventBus {
  publish<T>(event: DomainEvent<T>): Promise<void>;
  subscribe<T>(eventType: EventType, handler: EventHandler<T>): void;
  unsubscribe(eventType: EventType, handler: EventHandler): void;
  destroy(): Promise<void>;
}

// ─── In-Memory Implementation ────────────────────────────────────────────────

const logger = createLogger({ service: 'event-bus' });

export class InMemoryEventBus implements IEventBus {
  private handlers: Map<EventType, Set<EventHandler>> = new Map();

  async publish<T>(event: DomainEvent<T>): Promise<void> {
    logger.debug(`Publishing event: ${event.type}`, {
      eventId: event.id,
      source: event.source,
    });

    const eventHandlers = this.handlers.get(event.type);
    if (!eventHandlers || eventHandlers.size === 0) {
      logger.debug(`No handlers for event: ${event.type}`);
      return;
    }

    const promises = Array.from(eventHandlers).map(async (handler) => {
      try {
        await handler(event as DomainEvent);
      } catch (err) {
        logger.error(`Error in event handler for ${event.type}:`, { error: err });
      }
    });

    await Promise.allSettled(promises);
  }

  subscribe<T>(eventType: EventType, handler: EventHandler<T>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler as EventHandler);
    logger.debug(`Subscribed to event: ${eventType}`);
  }

  unsubscribe(eventType: EventType, handler: EventHandler): void {
    const eventHandlers = this.handlers.get(eventType);
    if (eventHandlers) {
      eventHandlers.delete(handler);
      logger.debug(`Unsubscribed from event: ${eventType}`);
    }
  }

  async destroy(): Promise<void> {
    this.handlers.clear();
    logger.info('Event bus destroyed');
  }
}

// ─── Singleton ───────────────────────────────────────────────────────────────

let instance: IEventBus | null = null;

export function getEventBus(): IEventBus {
  if (!instance) {
    instance = new InMemoryEventBus();
    logger.info('InMemoryEventBus initialized (swap for KafkaEventBus in production)');
  }
  return instance;
}

export function setEventBus(bus: IEventBus): void {
  instance = bus;
}
