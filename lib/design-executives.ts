export type DesignExecutive = {
  name: string;
  role: "Design Executive";
  phone: string;
};

// Add up to three more confirmed executives here as the V1 team expands.
export const designExecutives = [
  {
    name: "Varshitha",
    role: "Design Executive",
    phone: "9392273977",
  },
] as const satisfies readonly DesignExecutive[];

export function getDesignExecutiveByAssignedName(assignedName: string | null) {
  if (!assignedName) return null;

  return (
    designExecutives.find((executive) => executive.name === assignedName) ??
    null
  );
}
