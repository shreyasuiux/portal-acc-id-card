# Roboto Font Files

This directory contains locally hosted Roboto font files to ensure 100% consistent rendering across all devices and browsers.

## Files:

- `Roboto-Regular.woff2` (400 weight)
- `Roboto-Medium.woff2` (500 weight)
- `Roboto-Bold.woff2` (700 weight)

## Purpose:

These fonts are embedded locally to prevent:
- CDN loading failures
- Font fallback to serif (Times/Georgia)
- Cross-device inconsistencies
- PDF export font mismatches

## Critical:

PDF export WAITS for these fonts to load before generating output.
This ensures Image 1 style (Roboto) appears for ALL users, NEVER Image 2 style (serif fallback).
