import { createClient } from "@/utils/supabase/server";
import type { Metadata, ResolvingMetadata } from "next";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  { params }: LayoutProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  try {
    // params가 Promise이므로 await로 값을 추출
    const resolvedParams = await params;
    const slug = resolvedParams?.slug || '';
    
    if (!slug) {
      console.error("Slug is missing or invalid");
      return {
        title: "클라스",
        openGraph: {
          images: [],
        },
      };
    }
    
    const supabase = await createClient();
    
    const { data: journeyData, error } = await supabase
      .from("journeys")
      .select("name, image_url")
      .eq("uuid", slug)
      .single();

    if (error || !journeyData) {
      console.error("Journey metadata fetch error:", error);
      return {
        title: "클라스",
        openGraph: {
          images: [],
        },
      };
    }

    const previousImages = (await parent).openGraph?.images || [];

    return {
      title: "클라스 : " + journeyData.name || "클라스",
      openGraph: {
        images: [
          ...(journeyData.image_url ? [journeyData.image_url] : []),
          ...previousImages
        ],
      },
    };
  } catch (error) {
    console.error("Metadata generation error:", error);
    return {
      title: "클라스",
      openGraph: {
        images: [],
      },
    };
  }
}

export default function JourneyLayout({ children, params }: LayoutProps) {
  return <>{children}</>;
} 