-- Read-only smoke check for the synthetic seed in dev-foundation only.
-- Execute as one transaction after SET LOCAL ROLE leadrescue_app.
DO $verify$
DECLARE n integer; denied boolean;
BEGIN
  PERFORM public.leadrescue_assert_runtime();
  SELECT count(*) INTO n FROM "Lead";
  IF n<>0 THEN RAISE EXCEPTION 'Context-free read leaked leads'; END IF;
  PERFORM public.leadrescue_authorize('test:user1','00000000-0000-4000-8000-000000000101');
  SELECT count(*) INTO n FROM "Lead";
  IF n<>3 THEN RAISE EXCEPTION 'Manager A scope failed'; END IF;
  PERFORM public.leadrescue_authorize('test:user4','00000000-0000-4000-8000-000000000102');
  SELECT count(*) INTO n FROM "Lead";
  IF n<>1 THEN RAISE EXCEPTION 'Manager B scope failed'; END IF;
  PERFORM public.leadrescue_authorize('test:user2','00000000-0000-4000-8000-000000000101');
  SELECT count(*) INTO n FROM "Lead";
  IF n<>2 THEN RAISE EXCEPTION 'Broker scope failed'; END IF;
  SELECT count(*) INTO n FROM "Lead" WHERE id IN ('00000000-0000-4000-8000-000000000403','00000000-0000-4000-8000-000000000404');
  IF n<>0 THEN RAISE EXCEPTION 'Detail scope failed'; END IF;
  PERFORM public.leadrescue_authorize('test:user5','00000000-0000-4000-8000-000000000101');
  SELECT count(*) INTO n FROM "Lead";
  IF n<>0 THEN RAISE EXCEPTION 'Unassigned broker scope failed'; END IF;
  denied:=false;
  BEGIN
    PERFORM public.leadrescue_authorize('test:user1','00000000-0000-4000-8000-000000000102');
  EXCEPTION WHEN insufficient_privilege THEN denied:=true; END;
  IF NOT denied THEN RAISE EXCEPTION 'Cross-tenant access allowed'; END IF;
  denied:=false;
  BEGIN
    PERFORM public.leadrescue_authorize('test:user6','00000000-0000-4000-8000-000000000101');
  EXCEPTION WHEN insufficient_privilege THEN denied:=true; END;
  IF NOT denied THEN RAISE EXCEPTION 'Inactive membership allowed'; END IF;
  denied:=false;
  BEGIN
    PERFORM public.leadrescue_authorize('test:user7','00000000-0000-4000-8000-000000000101');
  EXCEPTION WHEN insufficient_privilege THEN denied:=true; END;
  IF NOT denied THEN RAISE EXCEPTION 'Platform admin bypass allowed'; END IF;
END $verify$;
