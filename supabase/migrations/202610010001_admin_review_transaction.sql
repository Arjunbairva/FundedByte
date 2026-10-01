-- FundedBytes admin transaction review
-- Requires public.accounts and public.transactions from the core schema.

create or replace function public.admin_review_transaction(
  p_transaction_id uuid,
  p_action text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tx public.transactions%rowtype;
  v_account public.accounts%rowtype;
  v_next_balance numeric;
begin
  if p_action not in ('approve', 'reject') then
    raise exception 'Unsupported admin action';
  end if;

  select * into v_tx
  from public.transactions
  where id = p_transaction_id
  for update;

  if not found then
    raise exception 'Transaction not found';
  end if;

  if v_tx.status <> 'Pending' then
    raise exception 'Only pending transactions can be reviewed';
  end if;

  if p_action = 'reject' then
    update public.transactions set status = 'Rejected' where id = v_tx.id;
    return jsonb_build_object('ok', true, 'status', 'Rejected');
  end if;

  select * into v_account
  from public.accounts
  where user_id = v_tx.user_id
  for update;

  if not found then
    raise exception 'Trading account not found';
  end if;

  if v_tx.amount is null or v_tx.amount <= 0 then
    raise exception 'Invalid transaction amount';
  end if;

  if v_tx.kind = 'deposit' then
    -- FundedBytes currently offers a 100% deposit bonus:
    -- $10 deposited => $10 bonus => $20 total account credit.
    v_next_balance := v_account.balance + (v_tx.amount * 2);
  elsif v_tx.kind = 'withdrawal' then
    if v_account.balance < v_tx.amount then
      raise exception 'Insufficient account balance for this withdrawal';
    end if;
    v_next_balance := v_account.balance - v_tx.amount;
  else
    raise exception 'Unsupported transaction type';
  end if;

  update public.transactions set status = 'Approved' where id = v_tx.id;
  update public.accounts
    set balance = v_next_balance, updated_at = now()
    where id = v_account.id;

  return jsonb_build_object('ok', true, 'status', 'Approved', 'balance', v_next_balance);
end;
$$;

revoke all on function public.admin_review_transaction(uuid, text) from public, anon, authenticated;
grant execute on function public.admin_review_transaction(uuid, text) to service_role;
