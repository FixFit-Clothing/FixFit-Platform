import { getDesignExecutiveByAssignedName } from "@/lib/design-executives";

type AssignedDesignExecutiveProps = {
  assignedName: string;
};

export function AssignedDesignExecutive({
  assignedName,
}: AssignedDesignExecutiveProps) {
  const executive = getDesignExecutiveByAssignedName(assignedName);

  if (!executive) {
    return (
      <section
        className="assigned-executive"
        aria-labelledby="design-executive-title"
      >
        <p className="section-eyebrow">Design executive assigned</p>
        <h2 id="design-executive-title">Your design executive is assigned</h2>
        <p>FixFit will share their contact details when they are available.</p>
      </section>
    );
  }

  return (
    <section
      className="assigned-executive"
      aria-labelledby="design-executive-title"
    >
      <p className="section-eyebrow">Design executive assigned</p>
      <h2 id="design-executive-title">Your Design Executive</h2>
      <p>
        Your order is confirmed! {executive.name} has been assigned as your
        design executive and will reach out to you.
      </p>
      <dl className="assigned-executive-details">
        <div>
          <dt>Name</dt>
          <dd>{executive.name}</dd>
        </div>
        <div>
          <dt>Role</dt>
          <dd>{executive.role}</dd>
        </div>
        <div>
          <dt>Contact</dt>
          <dd>
            <a href={`tel:${executive.phone}`}>{executive.phone}</a>
          </dd>
        </div>
      </dl>
    </section>
  );
}
