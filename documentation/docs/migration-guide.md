---
id: migration-guide
title: Migrating from previous versions
hide_title: true
description: This page describes the differences between Reveal 3 and 4.
---

import { DemoWrapper } from '@site/docs/components/DemoWrapper';

This document is an overview of some important differences between Reveal 3.x and Reveal 4.x.

## Potree prefix removed

In Reveal 3, several symbols has `Potree`-prefix which now has been replaced. This includes:

- `PotreePointColorType` is now called `PointColorType`
- `PotreePointShape` is now called `PointShape`
- `PotreePointSizeType` is now called `PointSizeType`
- `PotreeClassification` is now called `PointClassification`

The above changes are simple renames and migrating these should be very easy.
