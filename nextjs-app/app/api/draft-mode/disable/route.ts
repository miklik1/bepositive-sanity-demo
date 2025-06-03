import { draftMode } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/**
 * defineDisableDraftMode() is used to disable draft mode.
 * Learn more: https://github.com/sanity-io/next-sanity?tab=readme-ov-file#5-integrating-with-sanity-presentation-tool--visual-editing
 */

export async function GET(request: NextRequest) {
  const draft = await draftMode();
  draft.disable();
  return NextResponse.redirect(new URL("/", request.url));
}
