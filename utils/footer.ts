import dayjs from 'https://esm.sh/dayjs'; 

export const paginationFooter = `
    <div style="text-align: right;width: 297mm;font-size: 8px;">
        <span style="margin-right: 1cm">
            ${dayjs().format('DD/MM/YYYY')} - Página <span class="pageNumber"></span> de <span class="totalPages"></span>
        </span>
    </div>
`;