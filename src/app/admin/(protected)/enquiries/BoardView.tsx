"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { updateEnquiryStatus } from "@/app/actions/enquiries";
import { useDragSound } from "@/lib/useDragSound";
import type { Enquiry, EnquiryStatus } from "@/lib/types";

const COLUMNS: {
  key: EnquiryStatus;
  title: string;
  headerCls: string;
  pillCls: string;
}[] = [
  {
    key: "new",
    title: "New",
    headerCls: "bg-lime/30 border-lime",
    pillCls: "bg-lime/40 text-forest border-lime",
  },
  {
    key: "contacted",
    title: "Contacted",
    headerCls: "bg-amber-100 border-amber-200",
    pillCls: "bg-amber-100 text-amber-900 border-amber-200",
  },
  {
    key: "dormant",
    title: "Dormant",
    headerCls: "bg-sky-100 border-sky-200",
    pillCls: "bg-sky-100 text-sky-900 border-sky-200",
  },
  {
    key: "enrolled",
    title: "Enrolled",
    headerCls: "bg-emerald-100 border-emerald-200",
    pillCls: "bg-emerald-100 text-emerald-900 border-emerald-200",
  },
  {
    key: "closed",
    title: "Closed",
    headerCls: "bg-zinc-100 border-zinc-200",
    pillCls: "bg-zinc-100 text-zinc-700 border-zinc-200",
  },
];

type Props = {
  enquiries: Enquiry[];
  onSelect: (enquiry: Enquiry) => void;
};

/**
 * Grid columns all stretch to the tallest column's height, so with one long
 * column the empty columns' centers sit far below the pointer and
 * closestCenter never picks them. Resolve by what's under the pointer
 * instead, falling back to rect overlap mid-animation.
 */
const collideAtPointer: CollisionDetection = (args) => {
  const atPointer = pointerWithin(args);
  if (atPointer.length > 0) return atPointer;
  return rectIntersection(args);
};

export default function BoardView({ enquiries, onSelect }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<Enquiry[]>(enquiries);
  const [activeId, setActiveId] = useState<string | null>(null);
  const playDragSound = useDragSound();

  // Sync local state when parent data changes (after server refresh / edits)
  useEffect(() => {
    setItems(enquiries);
  }, [enquiries]);

  const sensors = useSensors(
    // 5px movement required to start a drag — so plain clicks open the drawer
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const grouped = COLUMNS.map((col) => ({
    ...col,
    cards: items.filter((e) => e.status === col.key),
  }));

  const activeEnquiry = activeId
    ? items.find((e) => e.id === activeId) ?? null
    : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
    playDragSound();
  }

  function findColumnOfId(id: string): EnquiryStatus | undefined {
    // Column drop zones use the status key as id, cards use their uuid
    if (COLUMNS.some((c) => c.key === id)) return id as EnquiryStatus;
    return items.find((e) => e.id === id)?.status;
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const card = items.find((e) => e.id === active.id);
    if (!card) return;

    const targetStatus = findColumnOfId(String(over.id));
    if (!targetStatus || targetStatus === card.status) return;

    // Optimistic update
    const previous = items;
    setItems((curr) =>
      curr.map((e) =>
        e.id === card.id ? { ...e, status: targetStatus } : e
      )
    );

    try {
      await updateEnquiryStatus(card.id, targetStatus);
      // pull fresh server data so other surfaces (KPI counts, dashboard) stay in sync
      router.refresh();
    } catch {
      // rollback on failure
      setItems(previous);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collideAtPointer}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {grouped.map((col) => (
          <Column
            key={col.key}
            id={col.key}
            title={col.title}
            headerCls={col.headerCls}
            pillCls={col.pillCls}
            cards={col.cards}
            onSelect={onSelect}
            activeId={activeId}
          />
        ))}
      </div>

      {/* dropAnimation={null} — the overlay vanishes instantly on drop so the
          real card (already updated optimistically) is visible immediately in
          its new column with no snap-to-stale-position flicker. */}
      <DragOverlay dropAnimation={null}>
        {activeEnquiry ? (
          <CardShell enquiry={activeEnquiry} dragging />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function Column({
  id,
  title,
  headerCls,
  pillCls,
  cards,
  onSelect,
  activeId,
}: {
  id: EnquiryStatus;
  title: string;
  headerCls: string;
  pillCls: string;
  cards: Enquiry[];
  onSelect: (e: Enquiry) => void;
  activeId: string | null;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={[
        "rounded-2xl border bg-white/60 transition-colors",
        isOver ? "ring-2 ring-forest/40 bg-cream" : "border-line",
      ].join(" ")}
    >
      <div
        className={`flex items-center justify-between px-4 py-3 border-b ${headerCls} rounded-t-2xl`}
      >
        <div className="font-medium text-sm">{title}</div>
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border font-medium bg-white/70 ${pillCls}`}
        >
          {cards.length}
        </span>
      </div>
      <SortableContext
        items={cards.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="p-2 space-y-2 min-h-[120px]">
          {cards.map((card) => (
            <SortableCard
              key={card.id}
              enquiry={card}
              onSelect={onSelect}
              hidden={activeId === card.id}
            />
          ))}
          {cards.length === 0 && (
            <div className="text-center text-xs text-muted py-6">
              Drop here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

function SortableCard({
  enquiry,
  onSelect,
  hidden,
}: {
  enquiry: Enquiry;
  onSelect: (e: Enquiry) => void;
  hidden?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: enquiry.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: hidden || isDragging ? 0 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => {
        if (!isDragging) onSelect(enquiry);
      }}
      layout
      transition={{ type: "spring", damping: 32, stiffness: 380 }}
    >
      <CardShell enquiry={enquiry} />
    </motion.div>
  );
}

function CardShell({
  enquiry,
  dragging,
}: {
  enquiry: Enquiry;
  dragging?: boolean;
}) {
  return (
    <div
      className={[
        "bg-white rounded-xl border p-3 select-none cursor-grab active:cursor-grabbing",
        dragging
          ? "border-forest shadow-2xl rotate-1 scale-[1.02]"
          : "border-line hover:border-ink/20 hover:shadow-sm",
        "transition-shadow",
      ].join(" ")}
    >
      <div className="font-medium text-sm truncate">{enquiry.name}</div>
      <div className="text-xs text-muted mt-0.5">{enquiry.phone}</div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
        {enquiry.city && (
          <span className="px-1.5 py-0.5 rounded bg-cream text-ink/70">
            {enquiry.city}
          </span>
        )}
        {enquiry.interest && (
          <span className="px-1.5 py-0.5 rounded bg-cream text-ink/70 truncate max-w-[140px]">
            {enquiry.interest}
          </span>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-muted">
        <span>{formatDate(enquiry.created_at)}</span>
        {enquiry.reminder_date && (
          <span className="inline-flex items-center gap-1 text-amber-800">
            ⏰ {formatReminder(enquiry.reminder_date)}
          </span>
        )}
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
  if (diffMin < 1) return "now";
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function formatReminder(date: string): string {
  return new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}
