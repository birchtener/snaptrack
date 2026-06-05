import { prisma } from "../../config/db";
import { Prisma, SystemAction } from "../../generated/prisma/client";
import { AppError } from "../../utils/app.error";
import { SystemLogService } from "../system-log/system-log.service";
export class EventService {
  static async createEvent(
    workspaceId: string,
    userId: string,
    name: string,
    startDate: string | Date,
    description?: string,
    endDate?: string | Date,
    infinite?: boolean,
    geofencingEnabled?: boolean,
    radius?: number,
    longitude?: number,
    latitude?: number,
  ) {
    try {
      const newEvent = await prisma.event.create({
        data: {
          workspace_id: workspaceId,
          name,
          description,
          created_by: userId,
          start_date: startDate,
          end_date: endDate,
          infinite,
          geofencing_enabled: geofencingEnabled,
          radius,
          longitude,
          latitude,
        },
        include: {
          creator: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
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

      return {
        id: newEvent.id,
        name: newEvent.name,
        description: newEvent.description,
        createdAt: newEvent.created_at,
        createdBy: newEvent.created_by,
        isActive: newEvent.is_active,
        archivedAt: newEvent.archived_at,
        workspaceId: newEvent.workspace_id,
        startData: newEvent.start_date,
        endDate: newEvent.end_date,
        infinite: newEvent.infinite,
        geofencingEnabled: newEvent.geofencing_enabled,
        radius: newEvent.radius,
        longitude: newEvent.longitude,
        latitude: newEvent.latitude,
        creator: {
          id: newEvent.creator?.id,
          firstName: newEvent.creator?.first_name,
          lastName: newEvent.creator?.last_name,
          email: newEvent.creator?.email,
        },
      };
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
        include: {
          creator: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
        },
      });

      return events.map((event) => ({
        id: event.id,
        name: event.name,
        description: event.description,
        createdAt: event.created_at,
        createdBy: event.created_by,
        isActive: event.is_active,
        archivedAt: event.archived_at,
        workspaceId: event.workspace_id,
        startDate: event.start_date,
        endDate: event.end_date,
        infinite: event.infinite,
        geofencingEnabled: event.geofencing_enabled,
        radius: event.radius,
        longitude: event.longitude,
        latitude: event.latitude,
        creator: {
          id: event.creator?.id,
          firstName: event.creator?.first_name,
          lastName: event.creator?.last_name,
          email: event.creator?.email,
        },
      }));
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
        include: {
          creator: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
        },
      });

      if (!event) {
        throw new AppError("Event not found", 404);
      }

      return {
        id: event.id,
        name: event.name,
        description: event.description,
        createdAt: event.created_at,
        createdBy: event.created_by,
        isActive: event.is_active,
        archivedAt: event.archived_at,
        workspaceId: event.workspace_id,
        startDate: event.start_date,
        endDate: event.end_date,
        infinite: event.infinite,
        geofencingEnabled: event.geofencing_enabled,
        radius: event.radius,
        longitude: event.longitude,
        latitude: event.latitude,
        creator: {
          id: event.creator?.id,
          firstName: event.creator?.first_name,
          lastName: event.creator?.last_name,
          email: event.creator?.email,
        },
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2003") {
          throw new AppError("Workspace not found", 404);
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
    startDate?: string,
    endDate?: string,
    infinite?: boolean,
    geofencingEnabled?: boolean,
    radius?: number,
    longitude?: number,
    latitude?: number,
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
          start_date: startDate,
          end_date: endDate,
          infinite,
          geofencing_enabled: geofencingEnabled,
          radius,
          longitude,
          latitude,
        },
        include: {
          creator: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
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

      return {
        id: updatedEvent.id,
        name: updatedEvent.name,
        description: updatedEvent.description,
        createdAt: updatedEvent.created_at,
        createdBy: updatedEvent.created_by,
        isActive: updatedEvent.is_active,
        archivedAt: updatedEvent.archived_at,
        workspaceId: updatedEvent.workspace_id,
        startDate: updatedEvent.start_date,
        endDate: updatedEvent.end_date,
        infinite: updatedEvent.infinite,
        geofencingEnabled: updatedEvent.geofencing_enabled,
        radius: updatedEvent.radius,
        longitude: updatedEvent.longitude,
        latitude: updatedEvent.latitude,
        creator: {
          id: updatedEvent.creator?.id,
          firstName: updatedEvent.creator?.first_name,
          lastName: updatedEvent.creator?.last_name,
          email: updatedEvent.creator?.email,
        },
      };
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
      await prisma.event.update({
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

      return;
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
