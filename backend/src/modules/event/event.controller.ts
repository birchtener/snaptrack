import { catchAsync } from "../../utils/catchAsync";
import { EventService } from "./event.service";
import { Request, Response } from "express";

export class EventController {
  static createEvent = catchAsync(async (req: Request, res: Response) => {
    const workspaceId = req.workspace!.id;
    const userId = req.user!.id;
    const { name, description } = req.body;

    const event = await EventService.createEvent(
      workspaceId,
      userId,
      name,
      description,
    );

    return res.status(201).json({
      success: true,
      data: event,
    });
  });

  static getEvents = catchAsync(async (req: Request, res: Response) => {
    const workspaceId = req.workspace!.id;
    const events = await EventService.getEvents(workspaceId);

    return res.status(200).json({
      success: true,
      data: events,
    });
  });

  static getEventById = catchAsync(async (req: Request, res: Response) => {
    const workspaceId = req.workspace!.id;
    const event = await EventService.getEventById(
      workspaceId,
      req.params.event_id as string,
    );

    return res.status(200).json({
      success: true,
      data: event,
    });
  });

  static updateEvent = catchAsync(async (req: Request, res: Response) => {
    const workspaceId = req.workspace!.id;
    const userId = req.user!.id;
    const eventId = req.params.event_id as string;
    const { name, description } = req.body;

    const event = await EventService.updateEvent(
      workspaceId,
      userId,
      eventId,
      name,
      description,
    );

    return res.status(200).json({
      success: true,
      data: event,
    });
  });

  static deleteEvent = catchAsync(async (req: Request, res: Response) => {
    const workspaceId = req.workspace!.id;
    const userId = req.user!.id;
    const eventId = req.params.event_id as string;
    await EventService.deleteEvent(workspaceId, userId, eventId);
    return res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  });
}
