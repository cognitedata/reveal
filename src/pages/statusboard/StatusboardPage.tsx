import React, { lazy, Suspense } from "react";
import { Spinner } from "../../components/Spinner/Spinner";

const Status = lazy(() =>
  import("./Statusboard").then((module) => ({
    default: module.Status,
  }))
);

export const StatusPage = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <Status />
    </Suspense>
  );
};
