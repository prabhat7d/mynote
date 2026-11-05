import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { LangfuseSpanProcessor } from '@langfuse/otel';

const provider = new NodeTracerProvider({
  spanProcessors: [new LangfuseSpanProcessor()],
});

provider.register();