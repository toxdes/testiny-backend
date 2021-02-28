#!/usr/bin/bash
# To delete everything from database, and start from scratch
# Usage only for convenient dev experience

# delete public schema, and create new
psql -d testiny-backend -c 'DROP SCHEMA "public" CASCADE;'
psql -d testiny-backend -c 'CREATE SCHEMA "public";'
# and restore permissions
psql -d testiny-backend -c 'GRANT ALL ON SCHEMA "public" TO postgres;'
psql -d testiny-backend -c 'GRANT ALL ON SCHEMA "public" TO public;'
