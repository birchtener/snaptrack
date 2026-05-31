import { prisma } from "../../config/db";
import { Prisma, SystemAction } from "../../generated/prisma/client";
import { AppError } from "../../utils/app.error";
import { SystemLogService } from "../system-log/system-log.service";
export class EventService {
  static async createEvent(
    workspaceId: string,
    userId: string,
    name: string,
    description?: string,
  ) {
    try {
      const newEvent = await prisma.event.create({
        data: {
          workspace_id: workspaceId,
          name,
          description,
          created_by: userId,
        },
      });

      void SystemLogService.createLog(
        workspaceId,
        userId as string,
        SystemAction.create_event,
        {
          event_id: newEvent.id,
          event_name: newEvent.name,
        },
      );

      return newEvent;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2003") {
          throw new AppError("Workspace or User not found", 404);
        } else if (error.code === "P2002") {
          throw new AppError("An event with this name already exists", 400);
        }
      }

      if (error instanceof AppError) throw error;

      if (process.env.NODE_ENV === "development")
        console.error("Unexpected error creating event:", error);
      throw new AppError("Failed to create event", 500);
    }
  }

  static async getEvents(workspaceId: string) {
    try {
      const events = await prisma.event.findMany({
        where: { workspace_id: workspaceId, is_active: true },
      });

      return events;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2003") {
          throw new AppError("Workspace not found", 404);
        } else if (error.code === "P2025") {
          throw new AppError("No events found for this workspace", 404);
        }
      }

      if (error instanceof AppError) throw error;

      if (process.env.NODE_ENV === "development")
        console.error("Unexpected error fetching events:", error);
      throw new AppError("Failed to fetch events", 500);
    }
  }

  static async getEventById(workspaceId: string, eventId: string) {
    try {
      const event = await prisma.event.findFirst({
        where: { id: eventId, workspace_id: workspaceId, is_active: true },
      });

      return event;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2003") {
          throw new AppError("Workspace not found", 404);
        } else if (error.code === "P2025") {
          throw new AppError("Event not found", 404);
        }
      }

      if (error instanceof AppError) throw error;

      if (process.env.NODE_ENV === "development")
        console.error("Unexpected error fetching event:", error);
      throw new AppError("Failed to fetch event", 500);
    }
  }

  static async updateEvent(
    workspaceId: string,
    userId: string,
    eventId: string,
    name?: string,
    description?: string,
  ) {
    try {
      const changesPayload: Record<string, any> = {};
      if (name !== undefined) changesPayload.name = name;
      if (description !== undefined) changesPayload.description = description;

      const updatedEvent = await prisma.event.update({
        where: {
          id: eventId,
          workspace_id: workspaceId,
          is_active: true,
        },
        data: {
          name,
          description,
        },
      });

      if (Object.keys(changesPayload).length > 0) {
        void SystemLogService.createLog(
          workspaceId,
          userId,
          SystemAction.update_event,
          {
            event_id: eventId,
            updated_fields: changesPayload,
          },
        );
      }

      return updatedEvent;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2003") {
          throw new AppError("Workspace or User not found", 404);
        } else if (error.code === "P2002") {
          throw new AppError("An event with this name already exists", 400);
        } else if (error.code === "P2025") {
          throw new AppError("Event not found", 404);
        }
      }

      if (error instanceof AppError) throw error;

      if (process.env.NODE_ENV === "development")
        console.error("Unexpected error updating event:", error);
      throw new AppError("Failed to update event", 500);
    }
  }

  static async deleteEvent(
    workspaceId: string,
    userId: string,
    eventId: string,
  ) {
    try {
      const deletedEvent = await prisma.event.update({
        where: {
          id: eventId,
          workspace_id: workspaceId,
          is_active: true,
        },
        data: {
          is_active: false,
          archived_at: new Date(),
        },
      });

      void SystemLogService.createLog(
        workspaceId,
        userId,
        SystemAction.delete_event,
        {
          event_id: eventId,
        },
      );

      return deletedEvent;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2003") {
          throw new AppError("Workspace or User not found", 404);
        } else if (error.code === "P2025") {
          throw new AppError("Event not found", 404);
        }
      }

      if (error instanceof AppError) throw error;

      if (process.env.NODE_ENV === "development")
        console.error("Unexpected error deleting event:", error);
      throw new AppError("Failed to delete event", 500);
    }
  }
}
