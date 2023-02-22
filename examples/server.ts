import { serve } from 'https://deno.land/std@0.177.0/http/mod.ts'

serve(() => new Response('Hello World\n'))

console.log('http://localhost:8000/')
