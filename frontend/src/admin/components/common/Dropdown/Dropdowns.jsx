// ─── CategoryDropdown ──────────────────────────────────────────────────────────
import {
  DropdownMenu,
  DropdownLink,
  DropdownItem,
  DropdownDivider,
} from "./DropdownMenu";

import useBasePath from "../../hooks/useBasePath";

export const CategoryDropdown = ({
  productId,
  productSlug,
  status,
  onDelete,
  onArchive,
}) => (
  <DropdownMenu>
    {(close) => (
      <>
        <DropdownLink
          to={`/admin/categories/edit/${productId}`}
          onClick={close}
        >
          Edit Category
        </DropdownLink>
        <DropdownItem
          variant="black"
          onClick={() => {
            onArchive(productId);
            close();
          }}
        >
          {status === "archived" ? "Unarchive" : "Archive"}
        </DropdownItem>
        <DropdownDivider />
        <DropdownItem
          variant="danger"
          onClick={() => {
            onDelete(productId);
            close();
          }}
        >
          Delete
        </DropdownItem>
      </>
    )}
  </DropdownMenu>
);

// ─── ColorwayDropdown ──────────────────────────────────────────────────────────
export const ColorwayDropdown = ({ colorId, status, onDelete, onArchive }) => (
  <DropdownMenu>
    {(close) => (
      <>
        <DropdownLink to={`/admin/colorways/edit/${colorId}`} onClick={close}>
          Edit
        </DropdownLink>
        <DropdownItem
          variant="black"
          onClick={() => {
            onArchive(colorId);
            close();
          }}
        >
          {status === "archived" ? "Unarchive" : "Archive"}
        </DropdownItem>
        <DropdownDivider />
        <DropdownItem
          variant="danger"
          onClick={() => {
            onDelete(colorId);
            close();
          }}
        >
          Delete
        </DropdownItem>
      </>
    )}
  </DropdownMenu>
);

// ─── CustomerDropdown ──────────────────────────────────────────────────────────
export const CustomerDropdown = ({
  customerId,
  customerSlug,
  status,
  onDelete,
  onArchive,
}) => {
  const basePath = useBasePath();
  return (
    <DropdownMenu>
      {(close) => (
        <>
          <DropdownLink
            to={`${basePath}/customers/view/${customerSlug}`}
            onClick={close}
          >
            View Details
          </DropdownLink>
          <DropdownLink
            to={`${basePath}/customers/edit/${customerSlug}`}
            onClick={close}
          >
            Edit Customer
          </DropdownLink>
          <DropdownItem
            variant="black"
            onClick={() => {
              onArchive(customerId);
              close();
            }}
          >
            {status === "archived" ? "Unarchive" : "Archive"}
          </DropdownItem>
          <DropdownDivider />
          <DropdownItem
            variant="danger"
            onClick={() => {
              onDelete(customerId);
              close();
            }}
          >
            Delete
          </DropdownItem>
        </>
      )}
    </DropdownMenu>
  );
};

// ─── DraftDropdown ─────────────────────────────────────────────────────────────
export const DraftDropdown = ({ draftId, onDelete, onPublish }) => {
  const basePath = useBasePath();
  return (
    <DropdownMenu>
      {(close) => (
        <>
          <DropdownLink
            to={`${basePath}/products/draft/${draftId}`}
            onClick={close}
          >
            Edit Draft
          </DropdownLink>
          <DropdownItem
            variant="success"
            onClick={() => {
              onPublish(draftId);
              close();
            }}
          >
            Publish
          </DropdownItem>
          <DropdownDivider />
          <DropdownItem
            variant="danger"
            onClick={() => {
              onDelete(draftId);
              close();
            }}
          >
            Delete
          </DropdownItem>
        </>
      )}
    </DropdownMenu>
  );
};

// ─── InventoryDropdown ─────────────────────────────────────────────────────────
export const InventoryDropdown = ({
  itemId,
  itemSlug,
  status,
  onDelete,
  onArchive,
}) => {
  const basePath = useBasePath();
  return (
    <DropdownMenu>
      {(close) => (
        <>
          <DropdownLink
            to={`${basePath}/inventory/view/${itemSlug}`}
            onClick={close}
          >
            View Details
          </DropdownLink>
          <DropdownLink
            to={`${basePath}/inventory/edit/${itemSlug}`}
            onClick={close}
          >
            Edit Item
          </DropdownLink>
          <DropdownItem
            variant="black"
            onClick={() => {
              onArchive(itemId);
              close();
            }}
          >
            {status === "archived" ? "Unarchive" : "Archive"}
          </DropdownItem>
          <DropdownDivider />
          <DropdownItem
            variant="danger"
            onClick={() => {
              onDelete(itemId);
              close();
            }}
          >
            Delete
          </DropdownItem>
        </>
      )}
    </DropdownMenu>
  );
};

// ─── ServiceDropdown ───────────────────────────────────────────────────────────
export const ServiceDropdown = ({
  serviceId,
  serviceSlug,
  status,
  onDelete,
  onArchive,
}) => (
  <DropdownMenu>
    {(close) => (
      <>
        <DropdownLink
          to={`/admin/services/view/${serviceSlug || serviceId}`}
          onClick={close}
        >
          View More
        </DropdownLink>
        <DropdownItem
          variant="black"
          onClick={() => {
            onArchive(serviceId);
            close();
          }}
        >
          {status === "archived" ? "Unarchive" : "Archive"}
        </DropdownItem>
        <DropdownDivider />
        <DropdownItem
          variant="danger"
          onClick={() => {
            onDelete(serviceId);
            close();
          }}
        >
          Delete
        </DropdownItem>
      </>
    )}
  </DropdownMenu>
);

// ─── SupplierDropdown ──────────────────────────────────────────────────────────
export const SupplierDropdown = ({
  supplierId,
  supplierSlug,
  status,
  onDelete,
  onArchive,
}) => (
  <DropdownMenu>
    {(close) => (
      <>
        <DropdownLink
          to={`/admin/suppliers/view/${supplierSlug}`}
          onClick={close}
        >
          View Details
        </DropdownLink>
        <DropdownLink
          to={`/admin/suppliers/edit/${supplierSlug}`}
          onClick={close}
        >
          Edit Supplier
        </DropdownLink>
        <DropdownItem
          variant="black"
          onClick={() => {
            onArchive(supplierId);
            close();
          }}
        >
          {status === "archived" ? "Unarchive" : "Archive"}
        </DropdownItem>
        <DropdownDivider />
        <DropdownItem
          variant="danger"
          onClick={() => {
            onDelete(supplierId);
            close();
          }}
        >
          Delete
        </DropdownItem>
      </>
    )}
  </DropdownMenu>
);

// ─── SystemUserDropdown ────────────────────────────────────────────────────────
export const SystemUserDropdown = ({ userId, status, onDelete, onArchive }) => (
  <DropdownMenu>
    {(close) => (
      <>
        <DropdownLink to={`/admin/system-users/view/${userId}`} onClick={close}>
          View Details
        </DropdownLink>
        <DropdownLink to={`/admin/system-users/edit/${userId}`} onClick={close}>
          Edit User
        </DropdownLink>
        <DropdownItem
          variant="black"
          onClick={() => {
            onArchive(userId);
            close();
          }}
        >
          {status === "archived" ? "Unarchive" : "Archive"}
        </DropdownItem>
        <DropdownDivider />
        <DropdownItem
          variant="danger"
          onClick={() => {
            onDelete(userId);
            close();
          }}
        >
          Delete
        </DropdownItem>
      </>
    )}
  </DropdownMenu>
);

// ─── InvoiceDropdown ───────────────────────────────────────────────────────────
export const InvoiceDropdown = ({
  invoiceId,
  invoiceNumber,
  status,
  onDelete,
  onArchive,
  onMarkAsPaid,
  onMarkAsUnpaid,
}) => {
  const basePath = useBasePath();
  return (
    <DropdownMenu width="w-44">
      {(close) => (
        <>
          <DropdownLink
            to={`${basePath}/invoices/view/${invoiceNumber}`}
            onClick={close}
          >
            View More
          </DropdownLink>
          <DropdownDivider />
          <DropdownLink
            to={`${basePath}/invoices/edit/${invoiceNumber}`}
            onClick={close}
          >
            Edit
          </DropdownLink>
          <DropdownDivider />
          {status === "archived" ? (
            <DropdownItem
              onClick={() => {
                onArchive(invoiceId);
                close();
              }}
            >
              Restore
            </DropdownItem>
          ) : (
            <>
              {status !== "paid" && (
                <DropdownItem
                  variant="success"
                  onClick={() => {
                    onMarkAsPaid(invoiceId);
                    close();
                  }}
                >
                  Mark as Paid
                </DropdownItem>
              )}
              {status !== "unpaid" && (
                <DropdownItem
                  variant="warning"
                  onClick={() => {
                    onMarkAsUnpaid(invoiceId);
                    close();
                  }}
                >
                  Mark as Unpaid
                </DropdownItem>
              )}
              <DropdownItem
                onClick={() => {
                  onArchive(invoiceId);
                  close();
                }}
              >
                Archive
              </DropdownItem>
            </>
          )}
          <DropdownDivider />
          <DropdownItem
            variant="danger"
            onClick={() => {
              onDelete(invoiceId);
              close();
            }}
          >
            Delete
          </DropdownItem>
        </>
      )}
    </DropdownMenu>
  );
};

// ─── InquiryDropdown ───────────────────────────────────────────────────────────
export const InquiryDropdown = ({
  inquiryId,
  inquiryNumber,
  status,
  priority,
  onDelete,
  onArchive,
  onRestore,
  onResponded,
  onCancelled,
  onPriorityChange,
}) => {
  const basePath = useBasePath();
  return (
    <DropdownMenu width="w-48">
      {(close) => (
        <>
          <DropdownLink
            to={`${basePath}/inquiries/view/${inquiryNumber}`}
            onClick={close}
          >
            View More
          </DropdownLink>
          <DropdownDivider />
          {priority?.toLowerCase() !== "high" && (
            <DropdownItem
              variant="danger"
              onClick={() => {
                onPriorityChange(inquiryId, "high");
                close();
              }}
            >
              Mark as High Priority
            </DropdownItem>
          )}
          {priority?.toLowerCase() !== "normal" && priority && (
            <DropdownItem
              onClick={() => {
                onPriorityChange(inquiryId, "normal");
                close();
              }}
            >
              Mark as Normal Priority
            </DropdownItem>
          )}
          <DropdownDivider />
          {status === "archived" ? (
            <DropdownItem
              onClick={() => {
                onRestore(inquiryId);
                close();
              }}
            >
              Restore
            </DropdownItem>
          ) : (
            <>
              {status !== "responded" && (
                <DropdownItem
                  variant="info"
                  onClick={() => {
                    onResponded(inquiryId);
                    close();
                  }}
                >
                  Mark as Responded
                </DropdownItem>
              )}
              {status !== "cancelled" && (
                <DropdownItem
                  variant="orange"
                  onClick={() => {
                    onCancelled(inquiryId);
                    close();
                  }}
                >
                  Mark as Cancelled
                </DropdownItem>
              )}
              <DropdownItem
                onClick={() => {
                  onArchive(inquiryId);
                  close();
                }}
              >
                Archive
              </DropdownItem>
            </>
          )}
          <DropdownDivider />
          <DropdownItem
            variant="danger"
            onClick={() => {
              onDelete(inquiryId);
              close();
            }}
          >
            Delete
          </DropdownItem>
        </>
      )}
    </DropdownMenu>
  );
};

// ─── ActionsDropdown (Product) ─────────────────────────────────────────────────
export const ActionsDropdown = ({
  productId,
  productSlug,
  status,
  onDelete,
  onArchive,
}) => {
  const basePath = useBasePath();
  return (
    <DropdownMenu>
      {(close) => (
        <>
          <DropdownLink
            to={`${basePath}/products/view/${productSlug}`}
            onClick={close}
          >
            View More
          </DropdownLink>
          <DropdownItem
            variant="black"
            onClick={() => {
              onArchive(productId);
              close();
            }}
          >
            {status === "archived" ? "Unarchive" : "Archive"}
          </DropdownItem>
          <DropdownDivider />
          <DropdownItem
            variant="danger"
            onClick={() => {
              onDelete(productId);
              close();
            }}
          >
            Delete
          </DropdownItem>
        </>
      )}
    </DropdownMenu>
  );
};
