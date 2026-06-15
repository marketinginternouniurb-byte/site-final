# Legacy function

This Edge Function is retained only for audit history and rollback analysis.

Current lead submissions should use the Worker route:

`/api/send-lead-to-cvcrm`

Do not deploy this function unless a separate review confirms it is still
required and it receives the same security controls as the Worker endpoint.
