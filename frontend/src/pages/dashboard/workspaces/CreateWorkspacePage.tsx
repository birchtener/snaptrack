import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import {
  createWorkspaceSchema,
  type CreateWorkspaceFormValues,
} from "./schema/workspace";
import { useCreateWorkspace } from "./hooks/useWorkspaceQueries";
import { FieldDefinitionsManager } from "./components/FieldDefinitionsManager";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
const CreateWorkspacePage = () => {
  const { mutate, isPending } = useCreateWorkspace();
  const navigate = useNavigate();
  const methods = useForm<CreateWorkspaceFormValues>({
    resolver: zodResolver(createWorkspaceSchema) as any,
    defaultValues: {
      name: "",
      fieldDefinitions: [],
    },
    mode: "onChange",
  });

  const isMobile = useIsMobile();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = methods;

  const onSubmit = (data: CreateWorkspaceFormValues) => {
    mutate(
      {
        name: data.name,
        fieldDefinitions: data.fieldDefinitions ?? [],
      },
      {
        onSuccess: ({ data: workspace }) => {
          reset();
          navigate(`/app/${workspace.id}/events`);
        },
      },
    );
  };

  if (isMobile) {
    return (
      <div className="w-full h-full bg-background text-foreground">
        <h1 className="text-2xl font-medium tracking-normal">
          Create Workspace
        </h1>
        <p className="mt-2 text-muted-foreground mb-4">
          Workspaces group student rosters and can include multiple custom
          fields for extra student metadata.
        </p>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Field>
              <FieldLabel>Workspace Name</FieldLabel>
              <FieldDescription>
                Use a clear name for the workspace your team will recognize.
              </FieldDescription>
              <FieldGroup>
                <Input
                  placeholder="Enter workspace name"
                  {...register("name")}
                  className="max-w-md"
                  disabled={isPending}
                />
              </FieldGroup>
              <FieldError>{errors.name?.message}</FieldError>
            </Field>

            <FieldDefinitionsManager />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/app/workspaces")}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending || !methods.formState.isValid}
              >
                {isPending ? "Creating..." : "Create Workspace"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    );
  }

  return (
    <div className="flex w-full justify-center px-4 py-6">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Create Workspace</CardTitle>
          <CardDescription>
            Workspaces group student rosters and can include multiple custom
            fields for extra student metadata.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Field>
                <FieldLabel>Workspace Name</FieldLabel>
                <FieldDescription>
                  Use a clear name for the workspace your team will recognize.
                </FieldDescription>
                <FieldGroup>
                  <Input
                    placeholder="Enter workspace name"
                    {...register("name")}
                    className="max-w-md"
                    disabled={isPending}
                  />
                </FieldGroup>
                <FieldError>{errors.name?.message}</FieldError>
              </Field>

              <FieldDefinitionsManager />

              <div className="flex justify-end gap-3 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/app/workspaces")}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || !methods.formState.isValid}
                >
                  {isPending ? "Creating..." : "Create Workspace"}
                </Button>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateWorkspacePage;
