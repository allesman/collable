import { injectSpeedInsights } from "@vercel/speed-insights/sveltekit";
import { injectAnalytics } from '@vercel/analytics/sveltekit'

injectSpeedInsights({
    sampleRate: 0.44 // Set the sample rate to 44%
});
injectAnalytics();