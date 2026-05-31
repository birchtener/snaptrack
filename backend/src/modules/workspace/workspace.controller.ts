import { Request, Response } from "express";
import { WorkspaceService } from "./workspace.service";
import { catchAsync } from "../../utils/catchAsync";

export class WorkspaceController {
  static createWorkspace = catchAsync(async (req: Request, res: Response) => {
    const { name } = req.body;
    const userId = req.user!.id;

    const workspace = await WorkspaceService.createWorkspace(name, userId);

    res.status(201).json({
      success: true,
      data: workspace,
    });
  });

  static getWorkspaces = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const workspaces = await WorkspaceService.getWorkspaces(userId);

    res.status(200).json({
      success: true,
      data: workspaces,
    });
  });

  static getWorkspaceById = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const workspaceId = req.workspace!.id;
    const workspace = await WorkspaceService.getWorkspaceById(
      workspaceId,
      userId,
    );

    res.status(200).json({
      success: true,
      data: workspace,
    });
  });

  static updateWorkspace = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const workspaceId = req.workspace!.id;
    const name = req.body.name;
    const fieldDefinitions = req.body.fieldDefinitions;

    const updatedWorkspace = await WorkspaceService.updateWorkspace(
      workspaceId,
      userId,
      name,
      fieldDefinitions,
    );

    res.status(200).json({
      success: true,
      data: updatedWorkspace,
    });
  });

  static deleteWorkspace = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const workspaceId = req.workspace!.id;

    const deletedWorkspace = await WorkspaceService.deleteWorkspace(
      workspaceId,
      userId,
    );

    res.status(200).json({
      success: true,
      data: deletedWorkspace,
    });
  });
}
