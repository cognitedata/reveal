import React, { lazy, Suspense } from "react";
import { Spinner } from "../../components/Spinner/Spinner";

const GuideTools = lazy(() =>
  import("./GuideTools").then((module) => ({
    default: module.GuideTools,
  }))
);

export const GuideToolsPage = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <GuideTools />
    </Suspense>
  );
};
