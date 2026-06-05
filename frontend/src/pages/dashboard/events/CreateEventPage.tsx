import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, Controller } from "react-hook-form";
import { createEventSchema, type CreateEventFormValues } from "./schema/event";
import { useCreateEvent } from "./hooks/useEventQueries";
import { useNavigate, useParams } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { GeofenceSelector } from "./components/GeofenceSelector";
import { Badge } from "@/components/ui/badge";

const CreateEventPage = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const isMobile = useIsMobile();
  const { mutate, isPending } = useCreateEvent(workspaceId || "");
  const navigate = useNavigate();

  const methods = useForm<CreateEventFormValues>({
    resolver: zodResolver(createEventSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      infinite: false,
      geofencingEnabled: false,
      radius: 100,
      dateConfig: {
        type: "single",
        singleDate: new Date(),
        rangeDates: { from: new Date(), to: undefined },
      },
    } as any,
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
    watch,
    control,
  } = methods;

  const infinite = watch("infinite" as any);
  const geofencingEnabled = watch("geofencingEnabled" as any);
  const latitude = watch("latitude" as any);
  const longitude = watch("longitude" as any);
  const radius = watch("radius" as any) || 100;

  const dateType = watch("dateConfig.type" as any) || "single";
  const singleDate = watch("dateConfig.singleDate" as any);
  const rangeDates = watch("dateConfig.rangeDates" as any) || {};

  const onSubmit = (data: CreateEventFormValues) => {
    if (!workspaceId) return;

    const start = data.infinite
      ? new Date()
      : data.dateConfig.type === "range"
        ? data.dateConfig.rangeDates?.from
        : data.dateConfig.singleDate;

    const end = data.infinite
      ? null
      : data.dateConfig.type === "range"
        ? data.dateConfig.rangeDates?.to
        : start;

    const payload = {
      name: data.name,
      description: data.description || undefined,
      startDate: start?.toISOString(),
      endDate: end ? end.toISOString() : undefined,
      infinite: !!data.infinite,
      geofencingEnabled: !!data.geofencingEnabled,
      latitude: data.geofencingEnabled ? data.latitude : undefined,
      longitude: data.geofencingEnabled ? data.longitude : undefined,
      radius: data.geofencingEnabled ? Number(data.radius) : undefined,
    };

    mutate(payload as any, {
      onSuccess: ({ data: event }) => {
        reset();
        navigate(`/app/${workspaceId}/event/${event.id}`);
      },
    });
  };

  if (isMobile) {
    return (
      <div className="w-full h-full bg-background text-foreground">
        <h1 className="text-2xl font-medium tracking-normal">Create Event</h1>
        <p className="mt-2 text-muted-foreground mb-4">
          Events represent activities where check-ins are logged via live QR
          scanning.
        </p>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel>Event Name</FieldLabel>
                <Badge>Required</Badge>
              </div>
              <FieldGroup>
                <Input
                  {...register("name")}
                  placeholder="e.g., Computer Science Hackathon"
                  className="w-full"
                  disabled={isPending}
                />
              </FieldGroup>
              <FieldError>{errors.name?.message}</FieldError>
            </Field>

            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel>Event Description</FieldLabel>
                <Badge variant="outline">Optional</Badge>
              </div>
              <FieldGroup>
                <Textarea
                  {...register("description")}
                  placeholder="Enter event details..."
                  className="w-full"
                  disabled={isPending}
                />
              </FieldGroup>
              <FieldError>{errors.description?.message}</FieldError>
            </Field>

            {!infinite && (
              <div className="p-4 border border-border/60 rounded-xl bg-muted/5 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div>
                    <span className="text-xs uppercase font-bold text-muted-foreground tracking-wide block">
                      Duration Metric
                    </span>
                    <span className="text-[11px] text-muted-foreground block mt-1">
                      Choose single-day check-ins or multi-day span perimeters.
                    </span>
                  </div>
                  <Tabs
                    value={dateType}
                    onValueChange={(value) => {
                      setValue("dateConfig.type" as any, value);

                      if (value === "single") {
                        setValue(
                          "dateConfig.rangeDates" as any,
                          { from: undefined, to: undefined },
                          {
                            shouldValidate: true,
                            shouldDirty: true,
                          },
                        );
                      } else if (value === "range") {
                        setValue("dateConfig.singleDate" as any, undefined, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                      }
                    }}
                  >
                    <TabsList className="grid w-48 grid-cols-2 bg-muted">
                      <TabsTrigger value="single" className="text-xs">
                        Single Day
                      </TabsTrigger>
                      <TabsTrigger value="range" className="text-xs">
                        Date Range
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <Field>
                  <FieldLabel className="text-xs uppercase font-bold text-muted-foreground tracking-wide">
                    Select Event Timing
                  </FieldLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal mt-1 border-border/80 bg-background hover:bg-muted/30 text-foreground",
                          dateType === "single"
                            ? !singleDate && "text-muted-foreground"
                            : !rangeDates?.from && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                        {dateType === "single" ? (
                          singleDate ? (
                            format(singleDate, "LLL dd, yyyy")
                          ) : (
                            <span>Pick a day</span>
                          )
                        ) : rangeDates?.from ? (
                          rangeDates.to ? (
                            <>
                              {format(rangeDates.from, "LLL dd, yyyy")} -{" "}
                              {format(rangeDates.to, "LLL dd, yyyy")}
                            </>
                          ) : (
                            format(rangeDates.from, "LLL dd, yyyy")
                          )
                        ) : (
                          <span>Pick custom range thresholds</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 border border-border bg-popover text-popover-foreground shadow-md"
                      align="start"
                    >
                      {dateType === "single" ? (
                        <Controller
                          control={control}
                          name="dateConfig.singleDate"
                          render={({ field }) => (
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              className="bg-popover text-popover-foreground"
                            />
                          )}
                        />
                      ) : (
                        <Controller
                          control={control}
                          name="dateConfig.rangeDates"
                          render={({ field }) => (
                            <Calendar
                              mode="range"
                              selected={field.value as any}
                              onSelect={field.onChange}
                              numberOfMonths={2}
                              className="bg-popover text-popover-foreground"
                            />
                          )}
                        />
                      )}
                    </PopoverContent>
                  </Popover>
                </Field>
              </div>
            )}

            <div className="flex items-center justify-between p-4 border border-border/60 rounded-xl bg-muted/5">
              <div>
                <label className="text-xs font-semibold text-foreground block">
                  Continuous / Infinite Lifecycle
                </label>
                <span className="text-[11px] text-muted-foreground block mt-1">
                  This event remains perpetually open and has no fixed
                  expiration date.
                </span>
              </div>
              <Controller
                control={control}
                name="infinite"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isPending}
                  />
                )}
              />
            </div>

            <div className="p-4 border border-border rounded-xl space-y-4 bg-muted/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-semibold text-foreground block">
                      Enable Geofencing Perimeter
                    </label>
                    <Badge variant="outline">Optional</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground block mt-1">
                    Restrict tracking scans to explicit location bounds
                    constraints.
                  </span>
                </div>
                <Controller
                  control={control}
                  name="geofencingEnabled"
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending}
                    />
                  )}
                />
              </div>

              {geofencingEnabled && (
                <GeofenceSelector
                  latitude={latitude}
                  longitude={longitude}
                  radius={radius}
                  disabled={isPending}
                  onLocationChange={({ lat, lng }) => {
                    setValue("latitude" as any, lat, {
                      shouldValidate: true,
                    });
                    setValue("longitude" as any, lng, {
                      shouldValidate: true,
                    });
                  }}
                  onRadiusChange={(nextRadius) => {
                    setValue("radius" as any, nextRadius, {
                      shouldValidate: true,
                    });
                  }}
                />
              )}
            </div>
            <div className="flex justify-end gap-3 mb-12">
              <Button
                disabled={isPending}
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isPending ||
                  !isValid ||
                  (geofencingEnabled && (!latitude || !longitude)) ||
                  (!infinite &&
                    dateType === "range" &&
                    (!rangeDates?.from || !rangeDates?.to))
                }
              >
                {isPending ? "Creating..." : "Create Event"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    );
  }

  return (
    <div className="flex w-full justify-center px-4 py-6 ">
      <Card className="w-full max-w-xl bg-card text-card-foreground border-border shadow-md">
        <CardHeader>
          <CardTitle>Create Event</CardTitle>
          <CardDescription>
            Events represent activities where check-ins are logged via live QR
            scanning.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel>Event Name</FieldLabel>
                  <Badge>Required</Badge>
                </div>
                <FieldGroup>
                  <Input
                    {...register("name")}
                    placeholder="e.g., Computer Science Hackathon"
                    className="w-full"
                    disabled={isPending}
                  />
                </FieldGroup>
                <FieldError>{errors.name?.message}</FieldError>
              </Field>

              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel>Event Description</FieldLabel>
                  <Badge variant="outline">Optional</Badge>
                </div>
                <FieldGroup>
                  <Textarea
                    {...register("description")}
                    placeholder="Enter event details..."
                    className="w-full"
                    disabled={isPending}
                  />
                </FieldGroup>
                <FieldError>{errors.description?.message}</FieldError>
              </Field>

              {!infinite && (
                <div className="p-4 border border-border/60 rounded-xl bg-muted/5 space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-border/40 pb-3">
                    <div>
                      <span className="text-xs uppercase font-bold text-muted-foreground tracking-wide block">
                        Duration Metric
                      </span>
                      <span className="text-[11px] text-muted-foreground block mt-0.5">
                        Choose single-day check-ins or multi-day span
                        perimeters.
                      </span>
                    </div>
                    <Tabs
                      value={dateType}
                      onValueChange={(val) =>
                        setValue("dateConfig.type" as any, val)
                      }
                    >
                      <TabsList className="grid w-48 grid-cols-2 bg-muted">
                        <TabsTrigger value="single" className="text-xs">
                          Single Day
                        </TabsTrigger>
                        <TabsTrigger value="range" className="text-xs">
                          Date Range
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  <Field>
                    <FieldLabel className="text-xs uppercase font-bold text-muted-foreground tracking-wide">
                      Select Event Timing
                    </FieldLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal mt-1 border-border/80 bg-background hover:bg-muted/30 text-foreground",
                            dateType === "single"
                              ? !singleDate && "text-muted-foreground"
                              : !rangeDates?.from && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                          {dateType === "single" ? (
                            singleDate ? (
                              format(singleDate, "LLL dd, yyyy")
                            ) : (
                              <span>Pick a day</span>
                            )
                          ) : rangeDates?.from ? (
                            rangeDates.to ? (
                              <>
                                {format(rangeDates.from, "LLL dd, yyyy")} -{" "}
                                {format(rangeDates.to, "LLL dd, yyyy")}
                              </>
                            ) : (
                              format(rangeDates.from, "LLL dd, yyyy")
                            )
                          ) : (
                            <span>Pick custom range thresholds</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 border border-border bg-popover text-popover-foreground shadow-md"
                        align="start"
                      >
                        {dateType === "single" ? (
                          <Controller
                            control={control}
                            name="dateConfig.singleDate"
                            render={({ field }) => (
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                className="bg-popover text-popover-foreground"
                              />
                            )}
                          />
                        ) : (
                          <Controller
                            control={control}
                            name="dateConfig.rangeDates"
                            render={({ field }) => (
                              <Calendar
                                mode="range"
                                selected={field.value as any}
                                onSelect={field.onChange}
                                numberOfMonths={2}
                                className="bg-popover text-popover-foreground"
                              />
                            )}
                          />
                        )}
                      </PopoverContent>
                    </Popover>
                  </Field>
                </div>
              )}

              <div className="flex items-center justify-between p-4 border border-border/60 rounded-xl bg-muted/5">
                <div>
                  <label className="text-xs font-semibold text-foreground block">
                    Continuous / Infinite Lifecycle
                  </label>
                  <span className="text-[11px] text-muted-foreground block mt-0.5">
                    This event remains perpetually open and has no fixed
                    expiration date.
                  </span>
                </div>
                <Controller
                  control={control}
                  name="infinite"
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending}
                    />
                  )}
                />
              </div>

              <div className="p-4 border border-border rounded-xl space-y-4 bg-muted/10">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-semibold text-foreground block">
                        Enable Geofencing Perimeter
                      </label>
                      <Badge variant="outline">Optional</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground block mt-0.5">
                      Restrict tracking scans to explicit location bounds
                      constraints.
                    </span>
                  </div>
                  <Controller
                    control={control}
                    name="geofencingEnabled"
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isPending}
                      />
                    )}
                  />
                </div>

                {geofencingEnabled && (
                  <GeofenceSelector
                    latitude={latitude}
                    longitude={longitude}
                    radius={radius}
                    disabled={isPending}
                    onLocationChange={({ lat, lng }) => {
                      setValue("latitude" as any, lat, {
                        shouldValidate: true,
                      });
                      setValue("longitude" as any, lng, {
                        shouldValidate: true,
                      });
                    }}
                    onRadiusChange={(nextRadius) => {
                      setValue("radius" as any, nextRadius, {
                        shouldValidate: true,
                      });
                    }}
                  />
                )}
              </div>

              <CardFooter className="p-0 flex justify-end gap-2 border-t border-border pt-4 mt-2">
                <Button
                  disabled={isPending}
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isPending ||
                    !isValid ||
                    (geofencingEnabled && (!latitude || !longitude)) ||
                    (!infinite &&
                      dateType === "range" &&
                      (!rangeDates?.from || !rangeDates?.to))
                  }
                >
                  {isPending ? "Creating..." : "Create Event"}
                </Button>
              </CardFooter>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateEventPage;
