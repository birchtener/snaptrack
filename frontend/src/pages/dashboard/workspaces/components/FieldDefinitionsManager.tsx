import { useRef, useState, useEffect } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { ChevronDown, ChevronRightIcon, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { type CreateWorkspaceFormValues } from "../schema/workspace";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const fieldTypeOptions = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" },
  { value: "date", label: "Date" },
] as const;

export function FieldDefinitionsManager() {
  const {
    register,
    control,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useFormContext<CreateWorkspaceFormValues>();

  const generatedKeysRef = useRef<Record<number, string>>({});

  const { fields, append, remove } = useFieldArray({
    control,
    name: "fieldDefinitions",
  });

  const handleLabelChange = (index: number, labelValue: string) => {
    const computedKey = labelValue
      .toLowerCase()
      .replace(/[^a-z0-9\s_]/g, "")
      .replace(/\s+/g, "_");

    const currentKey = getValues(`fieldDefinitions.${index}.key` as const);
    const lastGeneratedKey = generatedKeysRef.current[index];

    setValue(`fieldDefinitions.${index}.label` as any, labelValue, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (!currentKey || currentKey === lastGeneratedKey) {
      generatedKeysRef.current[index] = computedKey;
      setValue(`fieldDefinitions.${index}.key` as any, computedKey, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  const [openId, setOpenId] = useState<string[]>([]);
  const [fieldCounter, setFieldCounter] = useState(0);

  useEffect(() => {
    if (fields.length > fieldCounter) {
      const newField = fields[fields.length - 1];
      setOpenId((prev) => [...prev, newField.id]);
      setFieldCounter((prev) => prev + 1);
    }
  }, [fields, fieldCounter, setFieldCounter, setOpenId]);
  return (
    <Field>
      <div className="flex items-start justify-between gap-4">
        <div>
          <FieldLabel>Custom Fields</FieldLabel>
          <FieldDescription>
            Add multiple custom fields to capture extra student metadata.
          </FieldDescription>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => {
            append({ label: "", key: "", type: "text", required: false });
          }}
        >
          <Plus className="mr-2 size-4" />
          Add Field
        </Button>
      </div>

      <FieldGroup className="mt-2 space-y-4">
        {fields.length === 0 ? (
          <div className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
            No custom fields yet. Add one to begin defining the workspace
            schema.
          </div>
        ) : null}

        <Accordion
          type="multiple"
          className="flex flex-col gap-2"
          onValueChange={(values) => {
            setOpenId(values);
          }}
          value={openId}
        >
          {fields.map((field, index) => {
            const fieldType =
              watch(`fieldDefinitions.${index}.type` as const) ?? "text";

            return (
              <AccordionItem
                key={field.id}
                value={field.id}
                className="border rounded-xl"
              >
                <div key={field.id} className="rounded-xl px-4 shadow-sm">
                  <AccordionTrigger className="flex-row-reverse items-center justify-end gap-3 py-3 hover:no-underline *:data-[slot=accordion-trigger-icon]:hidden">
                    <div className="flex items-center justify-between gap-3 w-full">
                      <div>
                        <p className="text-sm font-semibold">
                          Field {index + 1}
                          <span className="text-xs text-muted-foreground ml-2">
                            {watch(`fieldDefinitions.${index}.label` as const) +
                              ` (${fieldType})` ||
                              `Unnamed Field (${fieldType})`}
                          </span>
                        </p>
                      </div>

                      <Trash2
                        className="size-4"
                        onClick={() => {
                          remove(index);
                          const newOpenIds = openId.filter(
                            (id) => id !== field.id,
                          );
                          setOpenId(newOpenIds);
                          setFieldCounter((prev) => prev - 1);
                        }}
                      />
                    </div>
                    <ChevronRightIcon className="text-muted-foreground size-4 shrink-0 transition-transform duration-200 group-aria-expanded/accordion-trigger:rotate-90" />
                  </AccordionTrigger>
                  <AccordionContent className="">
                    <p className="text-xs text-muted-foreground">
                      Configure the label, key, and type for this custom field.
                    </p>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                          Field Label
                        </Label>
                        <Input
                          {...register(
                            `fieldDefinitions.${index}.label` as any,
                          )}
                          placeholder="e.g. Student Grade"
                          onChange={(event) =>
                            handleLabelChange(index, event.target.value)
                          }
                        />
                        {errors.fieldDefinitions?.[index]?.label ? (
                          <FieldError>
                            {errors.fieldDefinitions[index]?.label?.message}
                          </FieldError>
                        ) : null}
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                          System Key
                        </Label>
                        <Input
                          {...register(`fieldDefinitions.${index}.key` as any)}
                          placeholder="student_grade"
                          className="font-mono"
                        />
                        <p className="text-xs text-muted-foreground">
                          Auto-generated from the label until you edit it
                          manually.
                        </p>
                        {errors.fieldDefinitions?.[index]?.key ? (
                          <FieldError>
                            {errors.fieldDefinitions[index]?.key?.message}
                          </FieldError>
                        ) : null}
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                          Field Type
                        </Label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full justify-between border-input bg-background px-3 text-sm font-normal"
                            >
                              <span>
                                {fieldTypeOptions.find(
                                  (option) => option.value === fieldType,
                                )?.label ?? "Select type"}
                              </span>
                              <ChevronDown className="size-4 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            className="min-w-44"
                            align="start"
                          >
                            <DropdownMenuRadioGroup
                              value={fieldType}
                              onValueChange={(value) =>
                                setValue(
                                  `fieldDefinitions.${index}.type` as any,
                                  value as any,
                                  {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                  },
                                )
                              }
                            >
                              {fieldTypeOptions.map((option) => (
                                <DropdownMenuRadioItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </DropdownMenuRadioItem>
                              ))}
                            </DropdownMenuRadioGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                          Required
                        </Label>
                        <div className="flex min-h-9 bg-input/30 items-center justify-between gap-3 rounded-md border px-3">
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium text-foreground">
                              Mark as required
                            </p>
                          </div>
                          <Switch
                            checked={watch(
                              `fieldDefinitions.${index}.required` as const,
                            )}
                            onCheckedChange={(checked) =>
                              setValue(
                                `fieldDefinitions.${index}.required` as any,
                                checked === true,
                                {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                },
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </div>
              </AccordionItem>
            );
          })}
        </Accordion>
      </FieldGroup>
    </Field>
  );
}
