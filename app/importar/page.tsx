import {requireChatGPTUser} from '@/app/chatgpt-auth';
import CsvReview from '@/components/leadrescue/csv-review';
export const dynamic='force-dynamic';
export default async function ImportPage(){await requireChatGPTUser('/importar');return <CsvReview/>;}
