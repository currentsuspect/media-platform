import { notFound } from "next/navigation";
import { MediaShell } from "../../../components/catalog/media-shell";
import { SeriesDetail } from "../../../components/catalog/series-detail";
import { getCatalogSeriesDetail } from "../../../lib/catalog-api";

export default async function SeriesPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const response = await getCatalogSeriesDetail(id);

  if (!response) {
    notFound();
  }

  return (
    <MediaShell
      eyebrow="Series"
      title={response.item.title}
      description="Structured from normalized scan data and enriched when provider metadata is available."
    >
      <SeriesDetail item={response.item} />
    </MediaShell>
  );
}
